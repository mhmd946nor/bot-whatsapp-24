// بوت واتساب عربي - نسخة 24 ساعة مجانا 100% 🛡️🔵 - ضد الباند + ضد النوم
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')
const express = require('express')

// ====== سيرفر صغير عشان ما ينام البوت (مهم لـ Render) ======
const app = express()
app.get('/', (req, res) => {
    res.send('✅ البوت الآمن شغال 24 ساعة 🔵🛡️')
})
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`🌐 السيرفر شغال على ${PORT} - البوت ما راح ينام`)
})

// ====== الإعدادات ======
let الترحيب_مفعل = true
let رسالة_الترحيب = "هلا والله وغلا حياك الله في قروبنا نورتنا 👋🔥"
let الوضع_الصارم = true
const المالك = "966571962908"
const المشرفين = ["966571962908", "966534668468", "967735698656"]

const اخر_رد = new Map()
const عدد_الرسائل = new Map()

function نوم(ms){return new Promise(r=>setTimeout(r,ms))}
function تأخير_عشوائي(){return Math.floor(Math.random()*2000)+1500}
function يقدر_يرد(رقم){
    const الان=Date.now()
    const اخر=اخر_رد.get(رقم)||0
    if(الان-اخر<3000) return false
    const رسائل=عدد_الرسائل.get(رقم)||[]
    const قبل_دقيقة=رسائل.filter(t=>الان-t<60000)
    if(قبل_دقيقة.length>5) return false
    اخر_رد.set(رقم,الان)
    قبل_دقيقة.push(الان)
    عدد_الرسائل.set(رقم,قبل_دقيقة)
    return true
}
async function ارسال_آمن(sock,الشات,النص,mentions=[]){
    await sock.sendPresenceUpdate('composing',الشات)
    await نوم(تأخير_عشوائي())
    await sock.sendPresenceUpdate('paused',الشات)
    if(mentions.length>0) await sock.sendMessage(الشات,{text:النص,mentions})
    else await sock.sendMessage(الشات,{text:النص})
}
async function شغل_البوت(){
    const {state,saveCreds}=await useMultiFileAuthState('auth')
    const sock=makeWASocket({
        auth:state,
        logger:P({level:'silent'}),
        printQRInTerminal:true,
        browser:["Chrome","Windows","10.0"],
        markOnlineOnConnect:false,
        syncFullHistory:false,
        getMessage: async () => undefined
    })
    sock.ev.on('creds.update',saveCreds)
    sock.ev.on('connection.update',async(update)=>{
        const {connection,lastDisconnect,qr}=update
        if(qr){
            console.log("==========================================")
            console.log("📱 افتح واتساب > الأجهزة المرتبطة > ربط جهاز")
            console.log("==========================================")
        }
        if(connection==='close'){
            const shouldReconnect=lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut
            console.log("انقطع الاتصال، جاري اعادة التشغيل...")
            if(shouldReconnect){
                await نوم(5000)
                شغل_البوت()
            }
        }else if(connection==='open'){
            console.log("✅ البوت الآمن شغال 24 ساعة بنجاح 🛡️🔵")
            console.log(`👑 المالك: ${المالك}`)
        }
    })
    sock.ev.on('messages.upsert',async({messages})=>{
        for(const msg of messages){
            if(!msg.message) continue
            if(msg.key.fromMe) continue
            if(msg.messageTimestamp){
                const عمر=Date.now()/1000-msg.messageTimestamp
                if(عمر>10) continue
            }
            const النص=msg.message.conversation||msg.message.extendedTextMessage?.text||""
            if(!النص) continue
            const الشات=msg.key.remoteJid
            const المرسل_الكامل=msg.key.participant||الشات
            const رقم_المرسل=المرسل_الكامل.split('@')[0].replace(/:.*/,'')
            const هو_المالك=رقم_المرسل===المالك||المشرفين.includes(رقم_المرسل)
            const هو_قروب=الشات.endsWith('@g.us')
            const النص_الصغير=النص.trim()
            if(!يقدر_يرد(رقم_المرسل)&&!هو_المالك) continue
            if(الوضع_الصارم && /https?:\/\/|www\.|\.com|\.net|\.org|t\.me|chat\.whatsapp\.com/i.test(النص)){
                if(!هو_المالك&&هو_قروب){
                    const مفتاح=`link-${الشات}`
                    if(!يقدر_يرد(مفتاح)) continue
                    await ارسال_آمن(sock,الشات,`🚫 يا @${رقم_المرسل} ممنوع الروابط! ⛔`,[المرسل_الكامل])
                    continue
                }
            }
            if(النص_الصغير==="تفعيل الترحيب"&&هو_المالك) await ارسال_آمن(sock,الشات,"✅ تم تفعيل الترحيب 🔥")
            else if(النص_الصغير==="تعطيل الترحيب"&&هو_المالك) await ارسال_آمن(sock,الشات,"🔴 تم تعطيل الترحيب")
            else if(النص_الصغير.startsWith("حط ترحيب ")&&هو_المالك){
                رسالة_الترحيب=النص_الصغير.replace("حط ترحيب ","")
                await ارسال_آمن(sock,الشات,`✅ تم حفظ ترحيبك: ${رسالة_الترحيب}`)
            }
            else if(النص_الصغير==="ترحيب افتراضي"&&هو_المالك){
                رسالة_الترحيب="هلا والله وغلا حياك الله في قروبنا نورتنا 👋🔥"
                await ارسال_آمن(sock,الشات,"✅ تم ارجاع الترحيب الافتراضي")
            }
            else if(النص_الصغير==="تفعيل الصارم"&&هو_المالك){
                الوضع_الصارم=true
                await ارسال_آمن(sock,الشات,"✅ تم تفعيل الوضع الصارم 🔨")
            }
            else if(النص_الصغير==="تعطيل الصارم"&&هو_المالك){
                الوضع_الصارم=false
                await ارسال_آمن(sock,الشات,"🔓 تم تعطيل الوضع الصارم")
            }
            else if(النص_الصغير==="وش الوضع"&&هو_المالك){
                await ارسال_آمن(sock,الشات,`📊 *حالة البوت*\n\n👑 المالك: انت\n👋 الترحيب: ${الترحيب_مفعل?"مفعل ✅":"معطل 🔴"}\n🔨 الصارم: ${الوضع_الصارم?"مفعل ✅":"معطل 🔴"}\n🛡️ الحماية: مفعلة ✅\n🤖 شغال 24 ساعة`)
            }
            else if(النص_الصغير==="الاوامر"&&هو_المالك){
                await ارسال_آمن(sock,الشات,`📜 *أوامر البوت:*\n\n• تفعيل الترحيب\n• تعطيل الترحيب\n• حط ترحيب [رسالتك]\n• ترحيب افتراضي\n• تفعيل الصارم\n• تعطيل الصارم\n• وش الوضع\n• الاوامر\n\nللجميع:\n• قوانين\n• السلام عليكم`)
            }
            else if(النص_الصغير==="قوانين"){
                await ارسال_آمن(sock,الشات,`📜 *قوانين القروب:*\n\n1️⃣ ممنوع روابط ⛔\n2️⃣ احترام الجميع 🤝\n3️⃣ ممنوع السب\n4️⃣ التفاعل مطلوب 🔥`)
            }
            else if(["السلام عليكم","سلام","هلا","هلا والله","مرحبا"].includes(النص_الصغير)){
                if(Math.random()<0.3){
                    await ارسال_آمن(sock,الشات,`وعليكم السلام يا @${رقم_المرسل} هلا والله نورتنا 😍`,[المرسل_الكامل])
                }
            }
        }
    })
    sock.ev.on('group-participants.update',async(update)=>{
        if(!الترحيب_مفعل) return
        if(update.action==='add'){
            await نوم(2000)
            for(const م of update.participants){
                if(م.includes(المالك)) continue
                await ارسال_آمن(sock,update.id,`${رسالة_الترحيب}\n\n@${م.split('@')[0]}`,[م])
                await نوم(1000)
            }
        }
    })
}
شغل_البوت()
