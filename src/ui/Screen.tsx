import React from 'react';import {ImageBackground,StyleSheet,View} from 'react-native';
export default function Screen({children,image,bright=false}:{children:React.ReactNode;image?:any;bright?:boolean}){return <ImageBackground source={image} resizeMode="cover" style={s.bg}><View style={[s.overlay,bright&&s.bright]}>{children}</View></ImageBackground>}
const s=StyleSheet.create({bg:{flex:1,backgroundColor:'#080E1C'},overlay:{flex:1,backgroundColor:'rgba(6,11,24,.55)'},bright:{backgroundColor:'rgba(6,11,24,.36)'}});
