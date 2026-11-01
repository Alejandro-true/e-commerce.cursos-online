import {seedData} from './domain.js';
const KEY='aulabreve-comunidad-demo-v1';
const PREFS='aulabreve-comunidad-preferences-v1';
export function loadDemo() { try {const d=JSON.parse(localStorage.getItem(KEY));if(d?.version===1&&['reviews','rewards','audits','events'].every(k=>Array.isArray(d[k])))return d;} catch{} return seedData(); }
export function saveDemo(data) {try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}}
export function resetDemo() {const d=seedData();saveDemo(d);return d;}
export function loadPreferences(){try{return JSON.parse(localStorage.getItem(PREFS))||{};}catch{return{};}}
export function savePreferences(data){try{localStorage.setItem(PREFS,JSON.stringify({baseUrl:data.baseUrl||''}));}catch{}}
