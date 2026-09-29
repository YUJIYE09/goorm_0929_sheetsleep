import React from 'react';
import {Alert, ScrollView, Text, TextInput, View, Switch, Pressable} from 'react-native';
import {router} from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Screen from '../src/ui/Screen';
import {Card, Label} from '../src/ui/Kit';
import {C} from '../src/ui/theme';
import {useAppStore} from '../src/store/useAppStore';
import {syncNotifications} from '../src/notifications/sync';

const notificationLabels: Record<string, string> = {
  main_sleep: '주 수면', recovery_sleep: '회복 수면', nap: '낮잠',
  wind_down: '수면 준비', caffeine_cutoff: '카페인 컷오프',
  light_tip: '퇴근길 빛 관리', wake: '기상', checkin: '아침 체크인',
};

export default function Settings() {
  const {prefs, setPrefs, reset, shiftTypes, setShiftType} = useAppStore();
  function change(key: keyof typeof prefs, delta: number) {
    const value = prefs[key] as number;
    setPrefs({[key]: Math.max(0, value + delta)} as any);
    syncNotifications();
  }
  async function exportData() {
    try {
      const s = useAppStore.getState();
      const data = {shiftTypes: s.shiftTypes, days: s.days, prefs: s.prefs, logs: s.logs, exportedAt: new Date().toISOString()};
      const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!base) throw new Error('No writable app directory');
      const uri = `${base}shiftsleep-backup.json`;
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(data, null, 2));
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, {mimeType: 'application/json', dialogTitle: '교대잠 데이터 내보내기'});
      else Alert.alert('내보내기 완료', uri);
    } catch { Alert.alert('내보내지 못했어요', '기기 저장 공간을 확인해 주세요.'); }
  }
  function deleteAll() {
    Alert.alert('모든 데이터 삭제', '근무표와 수면 기록, 설정을 삭제하고 처음으로 돌아갑니다.', [
      {text: '취소', style: 'cancel'},
      {text: '삭제', style: 'destructive', onPress: () => {reset(); router.replace('/onboarding');}},
    ]);
  }
  const row = (title: string, key: keyof typeof prefs, step: number, suffix: string) => <View key={key} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:13,borderBottomWidth:1,borderColor:C.line}}><Text style={{color:C.text,flex:1}}>{title}</Text><Pressable onPress={()=>change(key,-step)}><Text style={{color:C.accent,fontSize:20,paddingHorizontal:12}}>−</Text></Pressable><Text style={{color:C.text,minWidth:46,textAlign:'center'}}>{prefs[key] as number}{suffix}</Text><Pressable onPress={()=>change(key,step)}><Text style={{color:C.accent,fontSize:20,paddingHorizontal:12}}>＋</Text></Pressable></View>;
  return <Screen><ScrollView contentContainerStyle={{padding:20,paddingBottom:38}}>
    <Text style={{color:C.muted,fontSize:13,marginBottom:14}}>수면 계획의 기본값을 조정할 수 있어요.</Text>
    <Card><Label>근무 시간 · 24시간 표기</Label>{shiftTypes.filter(t=>!t.isOff).map(t=><View key={t.id} style={{flexDirection:'row',alignItems:'center',paddingVertical:8,borderBottomWidth:1,borderColor:C.line}}><Text style={{color:C.text,width:78}}>{t.id} · {t.label}</Text><TextInput defaultValue={t.start||''} onEndEditing={e=>{if(/^([01]\d|2[0-3]):[0-5]\d$/.test(e.nativeEvent.text)){setShiftType(t.id,{start:e.nativeEvent.text});syncNotifications();}}} placeholder="시작" placeholderTextColor={C.muted} style={{color:C.text,flex:1,textAlign:'center'}}/><Text style={{color:C.muted}}>—</Text><TextInput defaultValue={t.end||''} onEndEditing={e=>{if(/^([01]\d|2[0-3]):[0-5]\d$/.test(e.nativeEvent.text)){setShiftType(t.id,{end:e.nativeEvent.text});syncNotifications();}}} placeholder="종료" placeholderTextColor={C.muted} style={{color:C.text,flex:1,textAlign:'center'}}/></View>)}</Card>
    <Card><Label>수면 계획</Label>{row('필요 수면','sleepNeedMin',30,'분')}{row('출근 준비','prepMin',10,'분')}{row('귀가 이동','commuteMin',10,'분')}{row('수면 준비','windDownMin',5,'분')}{row('카페인 중단 여유','caffeineCutoffH',1,'시간')}{row('야간 전 낮잠','preNightNapMin',15,'분')}{row('야간 후 회복 수면 상한','recoverySleepCapMin',15,'분')}{row('야간 낮잠 최소 간격','napMinGapMin',15,'분')}{row('첫 야간 전 수면 지연','firstNightDelayMin',30,'분')}<View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingTop:14}}><Text style={{color:C.text}}>휴무 기준 취침</Text><TextInput defaultValue={prefs.freeSleepStart} onEndEditing={e=>{const v=e.nativeEvent.text;if(v.length===5&&v[2]===':'&&Number(v.slice(0,2))<24&&Number(v.slice(3,5))<60){setPrefs({freeSleepStart:v});syncNotifications();}}} placeholder='HH:mm' placeholderTextColor={C.muted} style={{color:C.text,width:84,textAlign:'center'}}/></View></Card>
    <Card><Label>알림</Label>{Object.entries(notificationLabels).map(([key,label])=><View key={key} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:7}}><Text style={{color:C.text}}>{label}</Text><Switch value={prefs.notify[key as keyof typeof prefs.notify]} onValueChange={v=>{setPrefs({notify:{[key]:v}});syncNotifications();}} trackColor={{true:C.lav,false:'#313B50'}} thumbColor={C.text}/></View>)}</Card>
    <Card><Label>데이터</Label><Pressable onPress={exportData} style={{paddingVertical:12}}><Text style={{color:C.accent,fontWeight:'600'}}>데이터 내보내기 (JSON) →</Text></Pressable><Pressable onPress={deleteAll} style={{paddingVertical:12}}><Text style={{color:'#F09A9A',fontWeight:'600'}}>모든 데이터 삭제</Text></Pressable></Card>
    <Card><Label>안내</Label><Text style={{color:C.muted,lineHeight:22}}>교대잠은 일반적인 수면 습관 정보를 바탕으로 일정을 제안하는 도구이며, 의학적 진단이나 치료를 대신하지 않습니다. 수면 문제가 계속되면 전문의와 상담하세요.</Text></Card>
    <Text style={{color:C.muted,textAlign:'center',fontSize:12}}>교대잠 · 모든 데이터는 이 기기에 저장됩니다.</Text>
  </ScrollView></Screen>;
}
