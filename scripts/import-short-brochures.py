"""Import the reviewed October short-safari/day-trip source set; never infer selling rates.
Run with bundled Python -I and --input <folder containing the supplied PDFs>.
"""
from pathlib import Path
from pypdf import PdfReader
import argparse, hashlib, json, re, shutil

parser=argparse.ArgumentParser();parser.add_argument('--input',type=Path,required=True)
args=parser.parse_args()
repo=Path(__file__).resolve().parents[1]
target=repo/'src/data/curatedPackages.json'
catalogue=json.loads(target.read_text(encoding='utf-8'))
def clean(text):return re.sub(r'\s+',' ',text.replace('\x7f','')).strip()
def between(text,start,end):return text.split(start,1)[1].split(end,1)[0]
def read(name):
 p=args.input/name;return p,[page.extract_text() for page in PdfReader(p).pages]
def source(p,price,programme=2):
 return dict(document=p.name,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),pricePage=price,programmePage=programme,receivedDate='2026-10-07')
def publish(p):
 # Keep original review drafts out of customer-facing assets; curated content is public.
 folder=repo/'output/verification/source-brochures';folder.mkdir(parents=True,exist_ok=True)
 shutil.copyfile(p,folder/p.name)
def add(pkg):
 assert pkg['days']==len(pkg['itinerary'])
 assert pkg['nights']==sum(d['overnight']!='None' for d in pkg['itinerary'])
 assert pkg['nights']==sum(s['nights'] for s in pkg['stays'])
 existing=next((i for i,p in enumerate(catalogue) if p['code']==pkg['code']),None)
 if existing is None:catalogue.append(pkg)
 else:catalogue[existing]=pkg

shorts={
 'BA-2D-ARUSHA':('2-day-arusha-national-park','arusha-national-park',None,[500,800,700,1100]),
 'BA-2D-TARANGIRE':('2-day-tarangire-safari','tarangire',None,[500,800,700,1200]),
 'BA-2D-MANYARA':('2-day-lake-manyara-safari','lake-manyara',None,[500,800,700,1200]),
 'BA-3D-TAR-NGOR':('3-day-tarangire-ngorongoro','tarangire','ngorongoro',[1500,2300,1900,3000]),
 'BA-3D-MANYARA-NGOR':('3-day-manyara-ngorongoro','lake-manyara','ngorongoro',[1500,2200,1900,3000]),
 'BA-3D-TAR-NIGHT':('3-day-tarangire-night-safari','tarangire',None,[1700,2500,2000,3200]),
}
departure='Ends at your chosen Arusha hotel; a room that night, dinner and onward airport transfer are not included. Ask for a reviewed flight connection or an extra Arusha night.'
for code,(slug,place,second,ranges) in shorts.items():
 p,pages=read(code+'.pdf');days=int(code[3]);header=pages[0].splitlines()[4:]
 name=header[0];summary=clean(between(pages[0],name,'Your holiday'))
 chunks=re.split(r'Day (\d+) \| ',pages[1])[1:];itinerary=[]
 for i in range(0,len(chunks),2):
  n=int(chunks[i]);block=chunks[i+1];title,body=block.split('\n',1)
  overnight=('Arusha' if n==1 else ('Tarangire Safari Lodge' if code.endswith('NIGHT') else 'Karatu')) if n<days else 'None'
  meals='dinner' if n==1 else ('breakfast, lunch and dinner' if n<days else 'breakfast and picnic lunch' if days==2 else 'breakfast and lunch')
  # Retain source transport/meal caveats in the programme instead of dropping final-day details.
  itinerary.append(dict(day=n,title=title,description=clean(body),overnight=overnight,meals=meals,timing='Driving times are estimates. '+(departure if n==days else 'Your guide confirms the daily timing.')))
 priceText=clean(between(pages[2],'USD per person: planning range','Assumes'))
 found=[int(x.replace(',','')) for x in re.findall(r'[\d,]+',priceText)]
 assert found==ranges,(code,found,ranges)
 includes=[clean(x) for x in between(pages[3],'Included in the proposed package','Not included').split('\x7f') if clean(x)]
 excludes=[clean(between(pages[3],'Not included','Protect your onward journey'))]
 stays=[dict(location='Arusha',nights=1,midrange=['Kahawa House','Pazuri Inn'],luxury=['Arusha Coffee Lodge','Hamerkop House'],note='Quoted property, room category and availability require confirmation.')]
 if days==3:
  stays.append(dict(location='Tarangire National Park' if code.endswith('NIGHT') else 'Karatu',nights=1,
   midrange=['Tarangire Safari Lodge tent or bungalow'] if code.endswith('NIGHT') else ['Ngorongoro Farm House','Tloma Lodge'],
   luxury=['Tarangire Safari Lodge suite, if available'] if code.endswith('NIGHT') else ['Kitela Lodge',"Gibb's Farm"],
   note='A suite at the same lodge is a request, not an all-luxury-camp itinerary. Another property requires night-drive access checks.' if code.endswith('NIGHT') else 'Alternatives require a revised quote; they are not equal-price substitutions.'))
 pace=clean(between(pages[0],'Choose the right pace','\n\n')) if '\n\n' in pages[0].split('Choose the right pace')[1] else clean(pages[0].split('Choose the right pace')[1])
 destinations=[place]+([second] if second else [])
 add(dict(slug=slug,code=code,name=name,duration=f'{days} days / {days-1} nights',days=days,nights=days-1,summary=summary,
  highlights=['Arrival and briefing in Arusha',itinerary[1]['title'],itinerary[-1]['title'] if days==3 else 'One wildlife day; Arusha hotel finish'],includes=includes,excludes=excludes,
  idealFor='travellers fitting a private safari into a short stay',destinations=destinations,plannerParkIds=[('manyara' if x=='lake-manyara' else x) for x in destinations],
  category='Night safari' if code.endswith('NIGHT') else 'Classic safari',travelStyle='Private daytime road safari; the night outing may be shared.' if code.endswith('NIGHT') else 'Private road safari',
  travelWindow='Year-round subject to weather, access and lodge operation.',seasonMonths=[],paceNote=pace+' '+departure,finishNote=departure,
  itinerary=itinerary,stays=stays,pricing=dict(status='on-request',currency='USD',basis='USD per person for two non-resident adults sharing one double/twin room and one private safari vehicle.',
   ranges=[dict(tier='midrange',minUsd=ranges[0],maxUsd=ranges[1]),dict(tier='luxury',minUsd=ranges[2],maxUsd=ranges[3])],
   note='These are planning estimates. Request a quote to confirm the selling price for your dates, rooms, party, permits and extras.'),
  imageKey='arusha' if place=='arusha-national-park' else 'manyara',featured=False,source=source(p,3)))
 publish(p)

placeMap={
 'DULUTI':'lake-duluti','TENGERU-COFFEE':'tengeru','TENGERU-COOK':'tengeru','MTOWAMBU':'mto-wa-mbu','OLPOPONGI':'olpopongi','ARUSHA-CITY':'arusha-city',
 'MATERUNI':'materuni','MATERUNI-COFFEE':'materuni','MARANGU':'marangu','CHEMKA':'chemka','CHALA':'lake-chala','JIPE':'lake-jipe','RAU':'rau-forest','MOSHI-TOWN':'moshi-town',
 'ARUSHA-PARK':'arusha-national-park','TARANGIRE':'tarangire','MANYARA':'lake-manyara','NGORONGORO':'ngorongoro','KILI-MARANGU':'kilimanjaro','KILI-SHIRA':'kilimanjaro','MKOMAZI':'mkomazi'}
for filename in ['Boker-Arusha-Experiences.pdf','Boker-Moshi-Experiences.pdf','Boker-Parks-and-Mountains.pdf']:
 p,pages=read(filename)
 for index,page in enumerate(pages):
  if 'Booking code: BA-DT-' not in page:continue
  code=re.search(r'Booking code: (BA-DT-[A-Z-]+)',page).group(1);suffix=code[6:]
  name=clean(page.split('Booking code:')[0].splitlines()[4:][0])
  # Some names span two lines in PDF text.
  name=clean('\n'.join(page.split('Booking code:')[0].splitlines()[4:]))
  summary=clean(between(page,code,'Quick facts'))
  town=clean(between(page,'Departure / return','Total duration')).split(' central hotel')[0]
  duration=clean(between(page,'Total duration','Road travel'));road=clean(between(page,'Road travel','Activity level'))
  activity=clean(between(page,'Activity level','Accommodation'))
  programme=clean(between(page,'Suggested daily programme','What to expect'))
  expectations=clean(page.split('What to expect',1)[1].split('Timing is a planning guide')[0])
  price=pages[index+1];values=re.findall(r'USD ([\d,]+)-([\d,]+)',price)[:2]
  assert len(values)==2
  included=clean(between(price,'Included:','Not included:'))
  excluded=clean(between(price,'Not included:','Activity-specific arrangements'))
  conditions=clean(between(price,'Activity-specific arrangements','Prepare and book'))
  reference=clean(price.split('Planning reference (not a supplier rate quote):',1)[1]) if 'Planning reference (not a supplier rate quote):' in price else ''
  add(dict(slug='day-trip-'+suffix.lower(),code=code,name=name,duration=f'1 day · {duration} · no overnight',days=1,nights=0,kind='day-trip',departureTown=town,
   summary=summary,highlights=[f'{town} central-hotel pickup and return',f'{duration} including travel',activity],includes=[included],excludes=[excluded],
   idealFor=f'guests already staying in {town} who want a separately booked day out',destinations=[placeMap[suffix]],plannerParkIds=[],
   category='Active adventure' if suffix.startswith('KILI-') else 'Day trip',travelStyle='Private day excursion; no accommodation or airport transfer',
   travelWindow='Subject to weather, access, permits and host availability.',seasonMonths=[],paceNote=conditions+' '+expectations,
   finishNote=f'Start and finish at a central {town} hotel. Be in town before the activity day; accommodation and airport transfers are not included.',
   itinerary=[dict(day=1,title=name,description=programme+' '+expectations,overnight='None',meals='simple lunch and drinking water; breakfast and dinner excluded',timing=f'{duration} in total; road travel: {road}. Times depend on conditions.')],stays=[],
   pricing=dict(status='on-request',currency='USD',basis=f'USD per non-resident adult from {town}; separate private-party estimates for two or four adults. Solo guests, children and residents require individual quotes.',
    ranges=[dict(tier=f'private party of {size} adults',minUsd=int(lo.replace(',','')),maxUsd=int(hi.replace(',',''))) for size,(lo,hi) in zip([2,4],values)],
    note='These estimates are for a private day trip with the stated party size. Your quote confirms pickup, fees, activities and the total price. They are not scheduled group departures.'),
   imageKey=town.lower(),featured=False,source=source(p,index+2,index+1),planningReference=reference))
 publish(p)
duplicate=args.input/'BA-3D-TAR-NGOR (1).pdf'
assert duplicate.read_bytes()==(args.input/'BA-3D-TAR-NGOR.pdf').read_bytes()
target.write_text(json.dumps(catalogue,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps(dict(preparedJourneys=len(catalogue),newShortSafaris=6,newDayTrips=21,duplicateSkipped=duplicate.name)))
