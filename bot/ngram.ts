"use strict";
const getToNgram=(e,t=3)=>{let r={};for(var u=0;u<t;u++)for(var s=0;s<e.length-u;s++){let l=e.substring(s,s+u+1);r[l]=r[l]?r[l]+1:1}return r},getValuesSum=e=>Object.values(e).reduce((e,t)=>e+t,0),calculate=(e,t)=>{let r=getToNgram(e),u=getToNgram(t),s=Object.keys(r),l=Object.keys(u),a=s.filter(e=>l.includes(e)),g=a.reduce((e,t)=>e+Math.min(r[t],u[t]),0),c=Math.sqrt(getValuesSum(r)*getValuesSum(u));return g/c};

export default calculate;