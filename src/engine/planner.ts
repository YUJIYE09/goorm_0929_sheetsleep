import {addDays, differenceInCalendarDays, format, parse} from 'date-fns';
import type {PlanEvent,PlanKind,Prefs,ShiftDay,ShiftType,YMD} from './types';
import {addMin,at,isoLocal,ymd} from './time';
const ev=(kind:PlanKind,start:Date,title:string,extra:Partial<PlanEvent>={}):PlanEvent=>({id:`${kind}-${isoLocal(start)}`,kind,start:isoLocal(start),title,...extra});
export function buildPlan(days:ShiftDay[],shiftTypes:ShiftType[],prefs:Prefs,from:YMD,to:YMD):PlanEvent[]{
 const typeById=new Map(shiftTypes.map(s=>[s.id,s])); const map=new Map(days.map(d=>[d.date,d.shiftTypeId]));
 const fromDate=parse(from,'yyyy-MM-dd',new Date()); const date=addDays(fromDate,-1); const count=differenceInCalendarDays(parse(to,'yyyy-MM-dd',new Date()),date); const out:PlanEvent[]=[];
 const shiftAt=(d:Date)=>typeById.get(map.get(ymd(d))||'OFF')||typeById.get('OFF')!;
 for(let i=0;i<=count;i++){const day=addDays(date,i), dateKey=ymd(day), shift=shiftAt(day), prev=shiftAt(addDays(day,-1)), next=shiftAt(addDays(day,1));
  const start=at(dateKey,shift.start!); let end=at(dateKey,shift.end!); if(end<=start)end=addDays(end,1);
  if(shift.id==='D'){
   const wake=addMin(start,-prefs.prepMin), sleepEnd=wake, sleepStart=addMin(sleepEnd,-prefs.sleepNeedMin); let st=sleepStart;
   if(prev.id==='E'){const e=at(ymd(addDays(day,-1)),prev.end!); const commuteEnd=addMin(e,prefs.commuteMin+prefs.windDownMin);if(commuteEnd>st)st=commuteEnd;}
   let warning:PlanEvent['warning']; if(st>sleepStart){warning='quick_return';} if((sleepEnd.getTime()-st.getTime())/60000<prefs.sleepNeedMin-60)warning=warning||'short_sleep';
   out.push(ev('main_sleep',st,'주 수면',{end:isoLocal(sleepEnd),plannedMin:Math.max(0,(sleepEnd.getTime()-st.getTime())/60000),warning}));
   out.push(ev('wake',sleepEnd,'일어날 시간')); out.push(ev('caffeine_cutoff',addMin(st,-prefs.caffeineCutoffH*60),'카페인 컷오프')); out.push(ev('wind_down',addMin(st,-prefs.windDownMin),'수면 준비'));
  } else if(shift.id==='E'&&next.id!=='D'){
   let s=addMin(end,prefs.commuteMin+prefs.windDownMin); const free=at(ymd(addDays(day,1)),prefs.freeSleepStart);if(free>s)s=free;let wake=addMin(s,prefs.sleepNeedMin);
   out.push(ev('main_sleep',s,'주 수면',{end:isoLocal(wake),plannedMin:(wake.getTime()-s.getTime())/60000}));out.push(ev('wake',wake,'일어날 시간'));out.push(ev('caffeine_cutoff',addMin(s,-prefs.caffeineCutoffH*60),'카페인 컷오프'));out.push(ev('wind_down',addMin(s,-prefs.windDownMin),'수면 준비'));
  } else if(shift.isNight){
   let previousWake:Date|undefined;
   if(i>0&&prev.isNight){const priorEnd=at(ymd(addDays(day,-1)),prev.end!);const sleepStart=addMin(priorEnd,prefs.commuteMin),sleepEnd=addMin(sleepStart,prefs.sleepNeedMin);out.push(ev('main_sleep',sleepStart,'주 수면',{end:isoLocal(sleepEnd),plannedMin:prefs.sleepNeedMin}));out.push(ev('wake',sleepEnd,'일어날 시간'));previousWake=sleepEnd;}
   if(!previousWake){const priorWakes=out.filter(e=>e.kind==='wake'&&new Date(e.start)<=start).sort((a,b)=>b.start.localeCompare(a.start));if(priorWakes[0])previousWake=new Date(priorWakes[0].start);}
   const napEnd=addMin(start,-prefs.prepMin),napStart=addMin(napEnd,-prefs.preNightNapMin);
   if(!previousWake||(napStart.getTime()-previousWake.getTime())/60000>=prefs.napMinGapMin)out.push(ev('nap',napStart,'야간근무 전 낮잠',{end:isoLocal(napEnd),plannedMin:prefs.preNightNapMin}));
   out.push(ev('caffeine_cutoff',addMin(addMin(end,prefs.commuteMin),-prefs.caffeineCutoffH*60),'카페인 컷오프'));out.push(ev('light_tip',end,'퇴근길 빛 관리',{detail:'퇴근길엔 선글라스로 밝은 빛을 줄여 보세요'}));
   if(!next.isNight){const s=addMin(end,prefs.commuteMin),e=addMin(s,prefs.recoverySleepCapMin);out.push(ev('recovery_sleep',s,'회복 수면',{end:isoLocal(e),plannedMin:prefs.recoverySleepCapMin}));}
  } else if(shift.isOff&&next.id!=='D'){let s=at(dateKey,prefs.freeSleepStart);if(next.isNight)s=addMin(s,prefs.firstNightDelayMin);const e=addMin(s,prefs.sleepNeedMin);out.push(ev('main_sleep',s,'주 수면',{end:isoLocal(e),plannedMin:prefs.sleepNeedMin}));out.push(ev('wake',e,'일어날 시간'));out.push(ev('caffeine_cutoff',addMin(s,-prefs.caffeineCutoffH*60),'카페인 컷오프'));out.push(ev('wind_down',addMin(s,-prefs.windDownMin),'수면 준비'));}
 }
 return out.filter(e=>e.start>=`${from}T00:00`&&e.start<=`${to}T23:59`).sort((a,b)=>a.start.localeCompare(b.start));
}
