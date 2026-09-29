export type HHmm = string; export type YMD = string;
export interface ShiftType { id:string; label:string; start:HHmm|null; end:HHmm|null; isOff:boolean; isNight:boolean; color:string }
export interface ShiftDay { date:YMD; shiftTypeId:string }
export type PlanKind='main_sleep'|'recovery_sleep'|'nap'|'wind_down'|'caffeine_cutoff'|'light_tip'|'wake';
export interface Prefs { sleepNeedMin:number; prepMin:number; commuteMin:number; windDownMin:number; caffeineCutoffH:number; preNightNapMin:number; napMinGapMin:number; recoverySleepCapMin:number; freeSleepStart:HHmm; firstNightDelayMin:number; notify:Record<PlanKind|'checkin',boolean>; soundId:'day_sleep_cover'|'wind_down_breath' }
export interface PlanEvent { id:string; kind:PlanKind; start:string; end?:string; title:string; detail?:string; warning?:'short_sleep'|'quick_return'; plannedMin?:number }
export interface SleepLog { date:YMD; rating:1|2|3|4|5; followed:'yes'|'partly'|'no'; note?:string; createdAt:string }
export const DEFAULT_SHIFTS:ShiftType[]=[{id:'D',label:'데이',start:'07:00',end:'15:00',isOff:false,isNight:false,color:'#F7B267'},{id:'E',label:'이브닝',start:'15:00',end:'23:00',isOff:false,isNight:false,color:'#A78BFA'},{id:'N',label:'나이트',start:'23:00',end:'07:00',isOff:false,isNight:true,color:'#6D8DFF'},{id:'OFF',label:'오프',start:null,end:null,isOff:true,isNight:false,color:'#7E90A8'}];
export const DEFAULT_PREFS:Prefs={sleepNeedMin:450,prepMin:90,commuteMin:40,windDownMin:30,caffeineCutoffH:6,preNightNapMin:90,napMinGapMin:240,recoverySleepCapMin:180,freeSleepStart:'23:30',firstNightDelayMin:120,notify:{main_sleep:true,recovery_sleep:true,nap:true,wind_down:true,caffeine_cutoff:true,light_tip:true,wake:true,checkin:true},soundId:'wind_down_breath'};
