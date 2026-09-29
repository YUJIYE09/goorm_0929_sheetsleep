import {addDays,format,parse} from 'date-fns';
import type {YMD,HHmm} from './types';
export const ymd=(d:Date)=>format(d,'yyyy-MM-dd');
export const at=(date:YMD,time:HHmm)=>parse(`${date} ${time}`,'yyyy-MM-dd HH:mm',new Date());
export const addMin=(d:Date,m:number)=>new Date(d.getTime()+m*60000);
export const plusDay=(date:YMD,n:number)=>ymd(addDays(parse(date,'yyyy-MM-dd',new Date()),n));
export const isoLocal=(d:Date)=>format(d,"yyyy-MM-dd'T'HH:mm");
export const mins=(a:Date,b:Date)=>Math.round((b.getTime()-a.getTime())/60000);
