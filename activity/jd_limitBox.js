/*
618限时盲盒@wenmoux
活动入口：签到领豆 618盲盒
优先助力前面的号,如满了依次往后
更新地址：https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_limitBox.js
已支持IOS双京东账号, Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, 小火箭，JSBox, Node.js
============Quantumultx===============
[task_local]
#618限时盲盒
30 7,19 1-18 6 * https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_limitBox.js, tag=618限时盲盒, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
================Loon==============
[Script]
cron "30 7,19 1-18 6 *" script-path=https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_limitBox.js tag=618限时盲盒
===============Surge=================
618限时盲盒 = type=cron,cronexp="30 7,19 1-18 6 *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_limitBox.js
============小火箭=========
618限时盲盒 = type=cron,script-path=https://raw.githubusercontent.com/Wenmoux/scripts/master/jd/jd_limitBox.js, cronexpr="30 7,19 1-18 6 *", timeout=3600, enable=true
 */
const $ =new Env('618限时盲盒');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

const randomCount = $.isNode() ? 20 : 5;
const notify = $.isNode() ? require('./sendNotify') : '';
let merge = {}
let codeList = [{"masterPin":"vlze5cgdvod2d3ipqiverxas3y","shareDate":"2021-06-06"},{"masterPin":"qbg36lckzzf2n6nrzoenswmkne","shareDate":"2021-06-06"}]
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
    cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

const JD_API_HOST = `https://api.m.jd.com/client.action`;

!(async () => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {
            "open-url": "https://bean.m.jd.com/"
        });
        return;
    }

    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
            $.index = i + 1;
            $.isLogin = true;
            $.nickName = '';
            $.beans = 0
            message = ''
            $.availableOpenBoxNum = 0
            $.cando = true
            //   await shareCodesFormat();
            console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
            if (!$.isLogin) {
                $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {
                    "open-url": "https://bean.m.jd.com/bean/signIndex.action"
                });

                if ($.isNode()) {
                    await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
                }
                continue
            }
            await dotask(1)
            await dotask(2)
            let actdata = await getcode()
            for (k = 0; k < $.availableOpenBoxNum; k++) {
                await limitBoxDraw()
            }
            await $.wait(1000);
        }
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        cookie = cookiesArr[i];
        if (cookie) {
            $.index = i + 1;
            console.log(`\n******开始【京东账号${$.index}】\n`);
            for (l = 0; l < codeList.length; l++) {
                console.log(`为 ${codeList[l].masterPin}助力中`)
                //   console.log(codeList[l])
                let status = await help(codeList[l].masterPin, codeList[l].shareDate)
                await $.wait(500);
                if (status === "LB604" || status === "LB204") {
                    l = 999
                } else if (status === "LB704") {
                    //     codeList.splice(l--, 1)  //删除已满助力码             
                }

            }
        }
    }

})()
.catch((e) => $.logErr(e))
    .finally(() => $.done())
//获取活动信息

function getcode() {
    return new Promise(async (resolve) => {
            const options = taskUrl("limitBoxHome", `{"source":"source","rnVersion":"3.9","rnClient":"1"}`)
            //  console.log(options)
            $.get(options, async (err, resp, data) => {
                    try {
                        if (err) {
                            console.log(`${JSON.stringify(err)}`);
                            console.log(`${$.name} API请求失败，请检查网路重试`);
                        } else {
                            data = JSON.parse(data);
                            //      console.log(data)
                            if (data.code === "0" && data.data && data.data.masterPin) {
                                for (list of data.data.taskList) {
                                    status = list.taskStatus == 1 ? "已完成" : "未完成"
                                    console.log(list.taskTitle + " : " + status)
                                    }
                                    if (data.data.taskList[2].taskStatus === "0") {
                                        codeList[codeList.length] = {
                                            masterPin: data.data.masterPin,
                                            shareDate: data.data.shareDate
                                        }

                                        console.log(`获取成功 邀请码：${data.data.masterPin}`)
                                    } else {
                                        console.log("已完成邀请任务")
                                    }
                                    let boxShowInfo = data.data.boxShowInfo
                                    $.availableOpenBoxNum = boxShowInfo.availableOpenBoxNum
                                    boxList = boxShowInfo.boxList
                                    for (i = 0; i < boxList.length; i++) {
                                        console.log(`盲盒 ${boxList[i].boxName} : ${boxList[i].boxNum}`)
                                    }
                                    console.log("可开盲盒次数: " + $.availableOpenBoxNum)
                                }
                            }
                        } catch (e) {
                            $.logErr(e, resp);
                        } finally {
                            resolve();
                        }
                    });
            });
    }


    function help(masterPin, shareDate) {
        return new Promise(async (resolve) => {
            const options = taskUrl("limitBoxHelp", `{"masterPin":"${masterPin}","shareDate":"${shareDate}"}`)
            //  console.log(options)
            $.get(options, async (err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`);
                        console.log(`${$.name} API请求失败，请检查网路重试`);
                    } else {
                        data = JSON.parse(data);
                        console.log(data)
                        if (data.errorCode) {
                            resolve(data.errorCode)
                            console.log(data.errorMessage)
                        } else if (data.data) {
                            if (data.data.helpResult) {
                                console.log(data.data.remindMsg)
                            } else {
                                console.log(data.data.errorMessage)
                            }
                            resolve(1)
                        } else {
                            console.log(data.errorMessage)
                            resolve(0)
                        }

                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve();
                }
            });
        });
    }

    function dotask(type) {
        return new Promise(async (resolve) => {
            const options = taskUrl("limitBoxDoTask", `{"type":"${type}"}`)
            $.get(options, async (err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`);
                        console.log(`${$.name} API请求失败，请检查网路重试`);
                    } else {
                        data = JSON.parse(data);
                        //   console.log(data)
                        if (data.errorCode) {
                            resolve(data.errorCode)
                            console.log(data.errorMessage)
                        } else if (data.data) {
                            console.log(data.data.remindMsg)
                        } else {
                            console.log(data.errorMessage)
                            resolve(0)
                        }

                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve();
                }
            });
        });
    }


    function limitBoxDraw() {
        return new Promise(async (resolve) => {
            const options = taskUrl("limitBoxDraw", `{}`)
            $.get(options, async (err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`);
                        console.log(`${$.name} API请求失败，请检查网路重试`);
                    } else {
                        data = JSON.parse(data);
                        //   console.log(data)
                        if (data.data.beanNum) {
                            console.log(`获得盲盒[${data.data.boxId}] ${data.data.beanNum}京豆`)
                        } else {
                            console.log(data)
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve();
                }
            });
        });
    }



    function taskUrl(functionId, body) {
        const time = Date.now();
        return {
            url: `https://api.m.jd.com/client.action?functionId=${functionId}&body=${encodeURIComponent(body)}&appid=ld&client=m&clientVersion=10.0.1&networkType=wifi&osVersion=11&uuid=2393039353533623-7383235613364343&openudid=2393039353533623-7383235613364343&eu=2393039353533623&fv=7383235613364343&jsonp=`,
            headers: {
                Accept: "application/json,text/plain, */*",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                Connection: "keep-alive",
                Cookie: cookie,
                Host: "api.m.jd.com",
                Referer: "https://h5.m.jd.com/rn/42yjy8na6pFsq1cx9MJQ5aTgu3kX/index.html?has_native=0&source=jkllimitbox&masterPin=vfugm3ft3prsqf4n4t7b46reqe5ac3f4ijdgqji&shareDate=2021-06-05&tttparams=mVO8qeyJnTGF0IjoiMzMuMjUyNzYyIiwiZ0xuZyI6IjEwNy4xNjA1MDcifQ5%3D%3D&sid=e5150a3fdd017952350b4b41294b145w&un_area=27_2442_2444_31912",
                "User-Agent": "jdapp;android;9.4.4;10;3b78ecc3f490c7ba;network/UNKNOWN;model/M2006J10C;addressid/138543439;aid/3b78ecc3f490c7ba;oaid/7d5870c5a1696881;osVer/29;appBuild/85576;psn/3b78ecc3f490c7ba|541;psq/2;uid/3b78ecc3f490c7ba;adk/;ads/;pap/JA2015_311210|9.2.4|ANDROID 10;osv/10;pv/548.2;jdv/0|iosapp|t_335139774|appshare|CopyURL|1606277982178|1606277986;ref/com.jd.lib.personal.view.fragment.JDPersonalFragment;partner/xiaomi001;apprpd/MyJD_Main;Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36",
            }
        }
    }

function jsonParse(str) {
    if (typeof str == "string") {
        try {
            return JSON.parse(str);
        } catch (e) {
            console.log(e);
            $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
            return [];
        }
    }
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}