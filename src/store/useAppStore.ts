import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand'; import {createJSONStorage,persist} from 'zustand/middleware';
import {DEFAULT_PREFS,DEFAULT_SHIFTS,type Prefs,type ShiftDay,type ShiftType,type SleepLog} from '../engine/types';
type PrefsPatch=Partial<Omit<Prefs,'notify'>> & {notify?:Partial<Prefs['notify']>};
type State={onboarded:boolean;shiftTypes:ShiftType[];days:ShiftDay[];prefs:Prefs;logs:SleepLog[];finishOnboarding:()=>void;setShift:(date:string,id:string)=>void;setShiftType:(id:string,patch:Partial<ShiftType>)=>void;setPrefs:(p:PrefsPatch)=>void;addLog:(l:SleepLog)=>void;reset:()=>void};
const initial={onboarded:false,shiftTypes:DEFAULT_SHIFTS,days:[] as ShiftDay[],prefs:DEFAULT_PREFS,logs:[] as SleepLog[]};
export const useAppStore=create<State>()(persist((set)=>({...initial,finishOnboarding:()=>set({onboarded:true}),setShift:(date,id)=>set(s=>({days:[...s.days.filter(d=>d.date!==date),{date,shiftTypeId:id}].sort((a,b)=>a.date.localeCompare(b.date))})),setShiftType:(id,patch)=>set(s=>({shiftTypes:s.shiftTypes.map(t=>t.id===id?{...t,...patch}:t)})),setPrefs:p=>set(s=>({prefs:{...s.prefs,...p,notify:{...s.prefs.notify,...p.notify}}})),addLog:l=>set(s=>({logs:[l,...s.logs.filter(x=>x.date!==l.date)]})),reset:()=>set(initial)}),{name:'shiftsleep-v1',storage:createJSONStorage(()=>AsyncStorage)}));
