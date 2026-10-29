/* Shape Swarm - game logic */
const GetById = Id => document.getElementById(Id);
const Canvas = GetById('GameCanvas'), Context = Canvas.getContext('2d'), Ui = GetById('UiLayer');
const Arena = 1000, Tau = Math.PI * 2, PlayerRadius = 14, JoyRadius = 60;
let Width, Height, Dpr, Zoom, SafeTop = 0, SafeBottom = 0;

function Resize(){
 Dpr = devicePixelRatio || 1;
 Width = innerWidth;
 Height = innerHeight;
 Canvas.width = Width * Dpr;
 Canvas.height = Height * Dpr;
 Zoom = Math.min(Width, Height) / 560;
 SafeTop = GetById('TopProbe').offsetHeight;
 SafeBottom = GetById('BottomProbe').offsetHeight;
}

addEventListener('resize', Resize);
Resize();

const Clamp = (V, Lo, Hi) => Math.max(Lo, Math.min(Hi, V)), Round2 = V => Math.round(V * 100) / 100, RandRange = (Lo, Hi) => Lo + Math.random() * (Hi - Lo);
function StorageGet(Key){try{return localStorage.getItem(Key)}catch(Err){return null}}
function StorageSet(Key, V){try{localStorage.setItem(Key, V)}catch(Err){}}
let BestWave =+ StorageGet('ShapeSwarmBest') || 0;

/* ---------- data ---------- */
const EnemyTypes = [
 {Hp: 10, Speed: 50, Radius: 10, Damage: 10, Sides: 0, Color: '#ff5d73', CoinValue: 1, XpValue: 1},
 {Hp: 5, Speed: 100, Radius: 5, Damage: 10, Sides: 3, Color: '#ffc857', CoinValue: 1, XpValue: 1},
 {Hp: 20, Speed: 30, Radius: 15, Damage: 5, Sides: 5, Color: '#9b7bff', CoinValue: 3, XpValue: 3},
 {Hp: 10, Speed: 50, Radius: 10, Damage: 10, Sides: 8, Color: '#ff8fd0', CoinValue: 2, XpValue: 2},
 {Hp: 500, Speed: 20, Radius: 50, Damage: 20, Sides: 10, Color: '#ff3b3b', CoinValue: 30, XpValue: 40}
];
const Item = (Name, Glyph, Key, Value, Cost, Opts) => ({Name, Glyph, Key, Value, Cost, ...Opts});
const Items = [
 Item('Power', '●', 'Damage', 5, 20, {Unit: 'Damage'}),
 Item('Overclock', '▲', 'FireRate', 0.25, 40, {Unit: 'Fire Rate'}),
 Item('Extra bolt', '⬢', 'Projectile', 1, 70, {IsInt: 1, Unit: 'Projectile'}),
 Item('Scope', '◉', 'Range', 25, 30, {Unit: 'Range'}),
 Item('Accelerator', '▷', 'ProjectileSpeed', 50, 50, {Unit: 'Bolt Speed'}),
 Item('Piercer', '◇', 'Piercing', 1, 70, {IsInt: 1, Unit: 'Pierce'}),
 Item('Precision', '◎', 'CriticalChance', 0.05, 20, {IsPct: 1, Unit: 'Crit Chance'}),
 Item('Lethality', '✦', 'CriticalDamage', 0.25, 35, {IsPct: 1, Unit: 'Crit Damage'}),
 Item('Hull', '■', 'MaximumHealth', 10, 20, {Unit: 'Maximum Health'}),
 Item('Repair', '✚', 'Regeneration', 1, 45, {Unit: 'Health Regeneration'}),
 Item('Plating', '▣', 'Defense', 1, 65,{IsInt: 1, Unit: 'Defense'}),
 Item('Evasion', '◌', 'Evasion', 0.05, 16, {IsPct: 1, Unit: 'Evasion'}),
 Item('Thrusters', '▶', 'MovementSpeed', 10, 25, {Unit: 'Movement Speed'}),
 Item('Magnet', '◐', 'PickupRange', 50, 20, {Unit: 'Pickup Range'}),
 Item('Leech', '◆', 'Lifesteal', 0.05, 45, {IsPct: 1, Unit:'Lifesteal'}),
 Item('Thorns', '▼', 'Thorn', 5, 25, {Unit: 'Thorn Damage'}),
 Item('Impact', '◀', 'Knockback', 10, 20, {Unit: 'Knockback'}),
 Item('Blast', '✱', 'BlastRadius', 25, 35, {Unit: 'Blast Radius'}),
 Item('Prospector', '$', 'CoinsBonus', 0.10, 40, {IsPct: 1, Unit: 'Coins'}),
 Item('Scholar', '★', 'ExperienceBonus', 0.10, 50, {IsPct: 1, Unit: 'Experience'}),
 Item('Fortune', '♣', 'Luck', 0.125, 20, {IsPct: 1, Unit: 'Luck'})
];

const StatCaps = {Bolts: 100, Dodge: 0.75, CritChance: 0.90, Pierce: 10, Leech: 0.90, BlastRadius: 750, Range: 500};
const TierMult = [1.00, 1.50, 2.00, 2.50, 4.00, 5.00], CostMult = [1.00, 1.75, 2.35, 3.25, 4.35, 5.50];
const RarityNames = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythical'], RarityColors = ['#FFFFFF', '#1EFF00', '#0070DD', '#A335EE', '#FF8000', '#1FDBDE'];
const Percent = V => Math.round(V * 100) + '%';
const StatList = [
 ['Damage', 'Damage', V => Round2(V)],
 ['FireRate', 'Fire Rate', V => Round2(V) + '/s'],
 ['Projectile', 'Projectile', V => V],
 ['Range', 'Range', V => V],
 ['ProjectileSpeed', 'Projectile Speed', V => V],
 ['Piercing', 'Piercing', V => V],
 ['CriticalChance', 'Critical Chance', Percent],
 ['CriticalDamage', 'Critical Damage', V => Percent(2 + V)],
 ['MaximumHealth', 'Maximum Health', V => V],
 ['Regeneration', 'Regeneration', V => Round2(V) + '/s'],
 ['Defense', 'Defense', V => V],
 ['Evasion', 'Evasion', Percent],
 ['MovementSpeed', 'Movement Speed', V => V],
 ['PickupRange', 'Pickup Pange', V => V],
 ['Lifesteal', 'Lifesteal', Percent],
 ['Thorn', 'Thorn', V => V],
 ['Knockback', 'Knockback', V => V],
 ['BlastRadius', 'Blast Radius', V => V],
 ['CoinsBonus', 'Coins Bonus', Percent],
 ['ExperienceBonus', 'Experience Bonus', Percent],
 ['Luck', 'Luck', Percent]
];

function ItemValue(It,Tier){return It.IsInt?[1,1,2,3][Tier]*It.Value:Round2(It.Value*TierMult[Tier])}
function ItemText(It,Tier){const V=ItemValue(It,Tier);return '+'+(It.IsPct?Percent(V):Round2(V))+' '+It.Unit}
function OfferPrice(Offer){return Math.round(Offer.Item.Cost*(1+Wave*.1)*CostMult[Offer.Tier])}
function RollTier(){const L=Stats.Luck,R=Math.random();return Wave>=8&&R<.02+L*.06?3:Wave>=4&&R<.1+L*.15+Wave*.005?2:Wave>=2&&R<.35+L*.2?1:0}
function RollOffers(Count){return Items.slice().sort(()=>Math.random()-.5).slice(0,Count).map(It=>({Item:It,Tier:RollTier(),Sold:false}))}
function ApplyOffer(Offer){
 const It=Offer.Item,V=ItemValue(It,Offer.Tier);
 Stats[It.Key]=Math.min(StatCaps[It.Key]??1e9,Stats[It.Key]+V);
 if(It.Key==='MaxHp')Player.Hp+=V;
}

/* ---------- state ---------- */
let Mode='menu',Wave=1,WaveTime=0,SpawnTimer=0,CollectTime=0,Coins=0,Time=0,Offers=[],Pending=0,Shake=0,DyingTime=0,HpView=0,Aim=0,RerollCost=0;
let Player,Stats,RunStats,Enemies=[],Bolts=[],EnemyBolts=[],Pickups=[],Particles=[],Texts=[],ActiveBanner=null,Camera={X:Arena/2,Y:Arena/2};
const Dots=Array.from({length:70},()=>({X:RandRange(0,Arena),Y:RandRange(0,Arena),Size:RandRange(1,2.5),Phase:RandRange(0,Tau)}));
let InputMode=matchMedia('(pointer:coarse)').matches?'touch':'key';

function NewRun(){
 Stats={Damage:8,FireRate:1.6,Bolts:1,Range:230,BoltSpeed:440,Pierce:0,CritChance:.05,CritDamage:0,MaxHp:40,Regen:0,Armor:0,Dodge:0,Speed:150,PickupRange:70,Leech:0,Thorns:0,Knockback:0,BlastRadius:0,CoinBonus:0,XpBonus:0,Luck:0};
 Player={X:Arena/2,Y:Arena/2,Hp:Stats.MaxHp,Inv:0,Cooldown:0,KnockX:0,KnockY:0,Xp:0,Level:1,Recoil:0};
 RunStats={Kills:0,Damage:0,Earned:0,Time:0};
 HpView=Player.Hp;Camera.X=Player.X;Camera.Y=Player.Y;
 Wave=1;Coins=0;Pending=0;Time=0;StartWave();
}
function WaveLength(){return Math.min(30+Wave*2,60)}
function StartWave(){
 Enemies=[];Bolts=[];EnemyBolts=[];Pickups=[];
 WaveTime=WaveLength();SpawnTimer=.5;Mode='play';Ui.className='';
 ShowBanner('Wave '+Wave,Wave%10===0?'Boss incoming':'','#4ff0d6');
 if(Wave%10===0)SpawnEnemy(4);
}
function PickType(){const R=Math.random();if(Wave>=7&&R<.12)return 3;if(Wave>=5&&R<.28)return 2;if(Wave>=3&&R<.5)return 1;return 0}
function SpawnEnemy(Kind){
 const Angle=RandRange(0,Tau),Dist=RandRange(300,400),Type=EnemyTypes[Kind],Scale=1+(Wave-1)*.28;
 Enemies.push({Kind,X:Clamp(Player.X+Math.cos(Angle)*Dist,20,Arena-20),Y:Clamp(Player.Y+Math.sin(Angle)*Dist,20,Arena-20),
  Hp:Type.Hp*Scale,MaxHp:Type.Hp*Scale,Speed:Type.Speed*(1+Math.min(Wave,30)*.01),Radius:Type.Radius,Damage:Type.Damage*(1+(Wave-1)*.1),
  Sides:Type.Sides,Color:Type.Color,Flash:0,Cooldown:RandRange(1,3),Rot:0,SpawnLeft:Kind===4?1.2:.6,SpawnTotal:Kind===4?1.2:.6,KnockX:0,KnockY:0,Dead:false});
}
function EnemyShot(En,Angle){EnemyBolts.push({X:En.X,Y:En.Y,Vx:Math.cos(Angle)*140,Vy:Math.sin(Angle)*140,Damage:En.Damage*.8,Life:5})}

/* ---------- effects ---------- */
function Burst(X,Y,Color,Count,Speed,Life){
 for(let I=0;I<Count&&Particles.length<350;I++){
  const Angle=RandRange(0,Tau),V=RandRange(.3,1)*Speed;
  Particles.push({X,Y,Vx:Math.cos(Angle)*V,Vy:Math.sin(Angle)*V,Life:Life||.5,MaxLife:Life||.5,Color,Size:RandRange(1.5,3.5)});
 }
}
function Ring(X,Y,Color,Size,Life){Particles.push({X,Y,Vx:0,Vy:0,Life:Life||.4,MaxLife:Life||.4,Color,Size,Ring:true})}
function FloatText(X,Y,Text,Color){if(Texts.length<30)Texts.push({X:X+RandRange(-8,8),Y,Text,Color,Life:.7})}
function ShowBanner(Text,Sub,Color){ActiveBanner={Text,Sub,Color,T:0,Max:1.8}}
function UpdateFx(Dt){
 Shake*=Math.pow(.005,Dt);
 for(const Pt of Particles){Pt.Life-=Dt;Pt.X+=Pt.Vx*Dt;Pt.Y+=Pt.Vy*Dt;Pt.Vx*=1-4*Dt;Pt.Vy*=1-4*Dt}
 Particles=Particles.filter(Pt=>Pt.Life>0);
 for(const Tx of Texts){Tx.Life-=Dt;Tx.Y-=40*Dt}
 Texts=Texts.filter(Tx=>Tx.Life>0);
 if(ActiveBanner){ActiveBanner.T+=Dt;if(ActiveBanner.T>ActiveBanner.Max)ActiveBanner=null}
 if(Player){
  Camera.X+=(Player.X-Camera.X)*Math.min(1,Dt*9);Camera.Y+=(Player.Y-Camera.Y)*Math.min(1,Dt*9);
  HpView+=(Player.Hp-HpView)*Math.min(1,Dt*8);
 }
 if(Mode==='dying'){DyingTime-=Dt;if(DyingTime<=0)GameOver()}
}
function DamageEnemy(En,Amount,IsCrit,Vx,Vy){
 En.Hp-=Amount;En.Flash=.1;RunStats.Damage+=Amount;
 FloatText(En.X,En.Y-En.Radius,Math.round(Amount),IsCrit?'#ffc857':'#ffffff');
 Burst(En.X,En.Y,En.Color,3,90,.35);
 if(Vx!==undefined&&Stats.Knockback){
  const Len=Math.hypot(Vx,Vy)||1,Force=Stats.Knockback*(En.Kind===4?.15:1)*10/(En.Radius+6);
  En.KnockX+=Vx/Len*Force*10;En.KnockY+=Vy/Len*Force*10;
 }
 if(En.Hp<=0&&!En.Dead){En.Dead=true;KillEnemy(En)}
}
function KillEnemy(En){
 const Type=EnemyTypes[En.Kind],Value=Math.ceil(Type.CoinValue*(1+Wave*.08)*(1+Stats.CoinBonus)),Pieces=Math.min(Value,En.Kind===4?12:1);
 for(let I=0;I<Pieces;I++){const Angle=RandRange(0,Tau);Pickups.push({X:En.X,Y:En.Y,Vx:Math.cos(Angle)*90,Vy:Math.sin(Angle)*90,Value:Math.ceil(Value/Pieces),Phase:RandRange(0,Tau)})}
 Burst(En.X,En.Y,En.Color,En.Kind===4?40:12,En.Kind===4?260:170,.6);Ring(En.X,En.Y,En.Color,En.Radius*2.4,.35);
 Shake=Math.max(Shake,En.Kind===4?12:2);
 RunStats.Kills++;
 if(Math.random()<Stats.Leech){Player.Hp=Math.min(Stats.MaxHp,Player.Hp+2);FloatText(Player.X,Player.Y-24,'+2','#4ff0d6')}
 Player.Xp+=Type.XpValue*(1+Stats.XpBonus);
 while(Player.Xp>=12+Player.Level*8){
  Player.Xp-=12+Player.Level*8;Player.Level++;Pending++;
  FloatText(Player.X,Player.Y-34,'LEVEL UP','#ffc857');Ring(Player.X,Player.Y,'#ffc857',60,.6);
 }
}
function HurtPlayer(Amount,Source){
 if(Player.Inv>0||(Mode!=='play'&&Mode!=='collect'))return false;
 if(Math.random()<Stats.Dodge){FloatText(Player.X,Player.Y-22,'dodge','#4ff0d6');Player.Inv=.25;return false}
 const Taken=Math.max(1,Amount-Stats.Armor);
 Player.Hp-=Taken;Player.Inv=.5;Shake=Math.max(Shake,6);
 FloatText(Player.X,Player.Y-22,'-'+Math.round(Taken),'#ff5d73');Burst(Player.X,Player.Y,'#ff5d73',8,150,.4);
 if(Source){
  const Dx=Player.X-Source.X,Dy=Player.Y-Source.Y,Len=Math.hypot(Dx,Dy)||1;
  Player.KnockX=Dx/Len*230;Player.KnockY=Dy/Len*230;
  if(Stats.Thorns)DamageEnemy(Source,Stats.Thorns);
 }
 if(Player.Hp<=0)PlayerDie();
 return true;
}
function PlayerDie(){
 Mode='dying';DyingTime=1;Player.Hp=0;Shake=16;
 Burst(Player.X,Player.Y,'#4ff0d6',50,300,.9);Ring(Player.X,Player.Y,'#4ff0d6',90,.6);Enemies=[];
}

/* ---------- screens ---------- */
function CardHtml(Offer,Index,IsFree,Animate){
 const Cost=OfferPrice(Offer),Disabled=!IsFree&&(Offer.Sold||State_CoinsLow(Cost));
 const Color=RarityColors[Offer.Tier];
 return `<button class="Card ${Animate?'In':''}" style="--Index:${Index};border-color:${Color};box-shadow:0 0 14px ${Color}33" data-${IsFree?'lv':'buy'}="${Index}" ${Disabled||Offer.Sold?'disabled':''}><em style="color:${Color}">${RarityNames[Offer.Tier]}</em><b>${Offer.Item.Glyph} ${Offer.Item.Name}</b><span>${ItemText(Offer.Item,Offer.Tier)}</span><i>${Offer.Sold?'Taken':IsFree?'Free':'● '+Cost}</i></button>`;
}
function State_CoinsLow(Cost){return Coins<Cost}
function OpenShop(){
 if(Pending>0)LevelScreen(true);
 else{Mode='shop';Offers=RollOffers(4);RerollCost=3+Wave;RenderShop(true)}
}
function LevelScreen(Animate){
 Mode='level';if(Animate)Offers=RollOffers(3);Ui.className='On';
 Ui.innerHTML=`<div class="Box"><h2>Level ${Player.Level-Pending+1}</h2><p>Pick one free upgrade${Pending>1?' ('+Pending+' pending)':''}.</p><div class="Cards">${Offers.map((O,I)=>CardHtml(O,I,true,Animate)).join('')}</div></div>`;
}
function RenderShop(Animate){
 Ui.className='On';
 Ui.innerHTML=`<div class="Box"><h2>Wave ${Wave} cleared</h2><div class="CoinLabel">● ${Coins}</div>
 <div class="Cards">${Offers.map((O,I)=>CardHtml(O,I,false,Animate)).join('')}</div>
 <div class="Row"><button class="Btn Alt" data-act="reroll" ${Coins<RerollCost?'disabled':''}>Reroll ● ${RerollCost}</button><button class="Btn" data-act="next">Start wave ${Wave+1}</button></div>
 <details open><summary>Stats · Level ${Player.Level} · HP ${Math.ceil(Player.Hp)}/${Stats.MaxHp}</summary><div class="StatGrid">${StatList.map(S=>`<div>${S[1]}<b>${S[2](Stats[S[0]])}</b></div>`).join('')}</div></details></div>`;
}
Ui.addEventListener('click',Ev=>{
 const Button=Ev.target.closest('button');if(!Button)return;
 const Data=Button.dataset;
 if(Data.buy!==undefined){
  const Offer=Offers[+Data.buy],Cost=OfferPrice(Offer);
  if(!Offer.Sold&&Coins>=Cost){Coins-=Cost;Offer.Sold=true;ApplyOffer(Offer);RenderShop(false)}
 }else if(Data.lv!==undefined){
  ApplyOffer(Offers[+Data.lv]);Pending--;
  if(Pending>0)LevelScreen(true);else{Mode='shop';Offers=RollOffers(4);RerollCost=3+Wave;RenderShop(true)}
 }else if(Data.act==='reroll'){
  if(Coins>=RerollCost){Coins-=RerollCost;RerollCost+=2;Offers=RollOffers(4);RenderShop(true)}
 }else if(Data.act==='next'){Wave++;StartWave()}
 else if(Data.act==='play')NewRun();
});
const FormatTime=S=>Math.floor(S/60)+':'+String(Math.floor(S%60)).padStart(2,'0');
function GameOver(){
 Mode='over';
 if(Wave>BestWave){BestWave=Wave;StorageSet('ShapeSwarmBest',BestWave)}
 Ui.className='On';
 Ui.innerHTML=`<div class="Box"><h1>Defeated</h1><p>Best: wave ${BestWave}</p><div class="Summary"><div>Wave<b>${Wave}</b></div><div>Level<b>${Player.Level}</b></div><div>Kills<b>${RunStats.Kills}</b></div><div>Damage<b>${Math.round(RunStats.Damage)}</b></div><div>Coins<b>${RunStats.Earned}</b></div><div>Time<b>${FormatTime(RunStats.Time)}</b></div></div><button class="Btn" data-act="play">Play again</button></div>`;
}
function ShowMenu(){
 Ui.className='On';
 Ui.innerHTML=`<div class="Box"><h1>Shape Swarm</h1><p>Survive endless waves. Your core fires at the nearest enemy automatically. Collect coins, level up, and buy upgrades between waves.</p><p>Phone: on-screen joystick.<br>PC: WASD or arrow keys.${BestWave?'<br>Best: wave '+BestWave:''}</p><button class="Btn" data-act="play">Play</button></div>`;
}

/* ---------- input ---------- */
let Joy=null;
const Keys={};
const JoyX=()=>Width/2;
const JoyY=()=>Height-SafeBottom-100;

function JoySet(Ev){
 let Dx=Ev.clientX-JoyX(),Dy=Ev.clientY-JoyY();
 const Len=Math.hypot(Dx,Dy);
 if(Len>JoyRadius){Dx=Dx/Len*JoyRadius;Dy=Dy/Len*JoyRadius}
 Joy.Dx=Dx;Joy.Dy=Dy;
}

Canvas.addEventListener('pointerdown',Ev=>{
 if(Ev.pointerType!=='mouse')InputMode='touch';
 if(InputMode!=='touch'||Math.abs(Ev.clientX-JoyX())>JoyRadius||Ev.clientY<Height*.5||Joy)return;
 Joy={Id:Ev.pointerId,Dx:0,Dy:0};
 JoySet(Ev);
 try{Canvas.setPointerCapture(Ev.pointerId)}catch(Err){}
});

Canvas.addEventListener('pointermove',Ev=>{
 if(Joy&&Joy.Id===Ev.pointerId)JoySet(Ev);
});

const PointerUp=Ev=>{
 if(Joy&&Joy.Id===Ev.pointerId)Joy=null;
};

Canvas.addEventListener('pointerup',PointerUp);
Canvas.addEventListener('pointercancel',PointerUp);

addEventListener('keydown',Ev=>{
 const Key=Ev.key.toLowerCase();
 if(('wasd'.includes(Key)&&Key.length===1)||Key.startsWith('arrow')){
  InputMode='key';Joy=null;Keys[Key]=1;Ev.preventDefault();
 }
});

addEventListener('keyup',Ev=>{Keys[Ev.key.toLowerCase()]=0});

/* ---------- update ---------- */
function Update(Dt){
 Time+=Dt;RunStats.Time+=Dt;
 let Mx=(Keys['d']||Keys['arrowright']?1:0)-(Keys['a']||Keys['arrowleft']?1:0),My=(Keys['s']||Keys['arrowdown']?1:0)-(Keys['w']||Keys['arrowup']?1:0);
 if(Joy){Mx+=Joy.Dx/JoyRadius;My+=Joy.Dy/JoyRadius}
 let Len=Math.hypot(Mx,My);if(Len>1){Mx/=Len;My/=Len;Len=1}
 Player.X=Clamp(Player.X+(Mx*Stats.Speed+Player.KnockX)*Dt,PlayerRadius,Arena-PlayerRadius);
 Player.Y=Clamp(Player.Y+(My*Stats.Speed+Player.KnockY)*Dt,PlayerRadius,Arena-PlayerRadius);
 Player.KnockX*=Math.max(0,1-9*Dt);Player.KnockY*=Math.max(0,1-9*Dt);
 Player.Inv-=Dt;Player.Recoil=Math.max(0,Player.Recoil-Dt*8);
 Player.Hp=Math.min(Stats.MaxHp,Player.Hp+Stats.Regen*Dt);
 if(Len>.2&&Math.random()<.6&&Particles.length<350)Particles.push({X:Player.X-Mx*10,Y:Player.Y-My*10,Vx:-Mx*30,Vy:-My*30,Life:.3,MaxLife:.3,Color:'#4ff0d6',Size:2});

 if(Mode==='play'){
  WaveTime-=Dt;if(WaveTime<=0){EndWave();return}
  SpawnTimer-=Dt;
  if(SpawnTimer<=0&&Enemies.length<140){
   const Count=1+Math.floor(Wave/6);for(let I=0;I<Count;I++)SpawnEnemy(PickType());
   SpawnTimer=Math.max(.3,1.2-Wave*.035);
  }
  Player.Cooldown-=Dt;
  let Nearest=null,NearDist=Stats.Range;
  for(const En of Enemies){
   if(En.SpawnLeft>0)continue;
   const Dist=Math.hypot(En.X-Player.X,En.Y-Player.Y)-En.Radius;
   if(Dist<NearDist){NearDist=Dist;Nearest=En}
  }
  if(Nearest){
   Aim=Math.atan2(Nearest.Y-Player.Y,Nearest.X-Player.X);
   if(Player.Cooldown<=0){
    for(let I=0;I<Stats.Bolts;I++){
     const Angle=Aim+(I-(Stats.Bolts-1)/2)*.2,Crit=Math.random()<Stats.CritChance;
     Bolts.push({X:Player.X,Y:Player.Y,Vx:Math.cos(Angle)*Stats.BoltSpeed,Vy:Math.sin(Angle)*Stats.BoltSpeed,Damage:Stats.Damage*(Crit?2+Stats.CritDamage:1),Life:(Stats.Range+40)/Stats.BoltSpeed,Pierce:Stats.Pierce,Hit:[],Crit});
    }
    Player.Cooldown=1/Stats.FireRate;Player.Recoil=1;
    Burst(Player.X+Math.cos(Aim)*20,Player.Y+Math.sin(Aim)*20,'#e8ecff',3,120,.15);
   }
  }
 }
 /* enemies */
 for(const En of Enemies){
  En.Flash-=Dt;En.Rot+=Dt*(En.Kind===4?.6:1.2);
  if(En.SpawnLeft>0){En.SpawnLeft-=Dt;continue}
  const Dx=Player.X-En.X,Dy=Player.Y-En.Y,Dist=Math.hypot(Dx,Dy)||1;let Speed=En.Speed;
  if(En.Kind===3){if(Dist<170)Speed=-En.Speed*.7;else if(Dist<230)Speed=0}
  if(En.Kind===1)En.Rot=Math.atan2(Dy,Dx)+Math.PI/2;
  En.X=Clamp(En.X+(Dx/Dist*Speed+En.KnockX)*Dt,10,Arena-10);En.Y=Clamp(En.Y+(Dy/Dist*Speed+En.KnockY)*Dt,10,Arena-10);
  En.KnockX*=Math.max(0,1-7*Dt);En.KnockY*=Math.max(0,1-7*Dt);
  if(En.Kind>=3){
   En.Cooldown-=Dt;
   if(En.Cooldown<=0){
    if(En.Kind===3)EnemyShot(En,Math.atan2(Dy,Dx));
    else{for(let I=0;I<12;I++)EnemyShot(En,I/12*Tau+En.Rot);Ring(En.X,En.Y,En.Color,En.Radius*2,.4)}
    En.Cooldown=En.Kind===4?2.4:2.2;
   }
  }
 }
 /* solid collisions: enemy vs enemy, enemy vs player */
 for(let I=0;I<Enemies.length;I++){
  const A=Enemies[I];if(A.SpawnLeft>0)continue;
  for(let J=I+1;J<Enemies.length;J++){
   const B=Enemies[J];if(B.SpawnLeft>0)continue;
   const Dx=B.X-A.X,Dy=B.Y-A.Y,Reach=A.Radius+B.Radius;
   if(Math.abs(Dx)<Reach&&Math.abs(Dy)<Reach){
    const Dist=Math.hypot(Dx,Dy)||1;
    if(Dist<Reach){
     const Over=(Reach-Dist),MassA=A.Radius*A.Radius,MassB=B.Radius*B.Radius,WeightA=MassB/(MassA+MassB),WeightB=MassA/(MassA+MassB);
     A.X-=Dx/Dist*Over*WeightA;A.Y-=Dy/Dist*Over*WeightA;B.X+=Dx/Dist*Over*WeightB;B.Y+=Dy/Dist*Over*WeightB;
    }
   }
  }
  const Dx=Player.X-A.X,Dy=Player.Y-A.Y,Dist=Math.hypot(Dx,Dy)||1,Reach=A.Radius+PlayerRadius;
  if(Dist<Reach+2)HurtPlayer(A.Damage,A);
  if(Dist<Reach&&Mode!=='dying'){
   const Over=Reach-Dist,MassA=A.Radius*A.Radius,PlayerShare=MassA/(MassA+PlayerRadius*PlayerRadius*1.5);
   Player.X=Clamp(Player.X+Dx/Dist*Over*PlayerShare,PlayerRadius,Arena-PlayerRadius);
   Player.Y=Clamp(Player.Y+Dy/Dist*Over*PlayerShare,PlayerRadius,Arena-PlayerRadius);
   A.X-=Dx/Dist*Over*(1-PlayerShare);A.Y-=Dy/Dist*Over*(1-PlayerShare);
  }
 }
 if(Mode==='dying')return;
 /* bolts */
 for(const Bt of Bolts){
  Bt.X+=Bt.Vx*Dt;Bt.Y+=Bt.Vy*Dt;Bt.Life-=Dt;
  for(const En of Enemies){
   if(En.SpawnLeft>0||En.Hp<=0||Bt.Hit.includes(En)||Math.hypot(En.X-Bt.X,En.Y-Bt.Y)>=En.Radius+4)continue;
   Bt.Hit.push(En);DamageEnemy(En,Bt.Damage,Bt.Crit,Bt.Vx,Bt.Vy);
   if(Stats.BlastRadius){
    Ring(En.X,En.Y,'#ffc857',Stats.BlastRadius,.25);
    for(const Other of Enemies){
     if(Other!==En&&Other.Hp>0&&Other.SpawnLeft<=0&&Math.hypot(Other.X-En.X,Other.Y-En.Y)<Stats.BlastRadius+Other.Radius)DamageEnemy(Other,Bt.Damage*.5,false,Other.X-En.X,Other.Y-En.Y);
    }
   }
   if(Bt.Pierce<=0){Bt.Life=0;break}
   Bt.Pierce--;
  }
 }
 for(const Eb of EnemyBolts){
  Eb.X+=Eb.Vx*Dt;Eb.Y+=Eb.Vy*Dt;Eb.Life-=Dt;
  if(Math.hypot(Eb.X-Player.X,Eb.Y-Player.Y)<PlayerRadius){HurtPlayer(Eb.Damage);Eb.Life=0}
 }
 if(Mode==='dying')return;
 Enemies=Enemies.filter(En=>En.Hp>0);
 Bolts=Bolts.filter(Bt=>Bt.Life>0&&Bt.X>0&&Bt.X<Arena&&Bt.Y>0&&Bt.Y<Arena);
 EnemyBolts=EnemyBolts.filter(Eb=>Eb.Life>0);
 const Magnetic=Mode==='collect';
 for(const Pk of Pickups){
  Pk.X+=Pk.Vx*Dt;Pk.Y+=Pk.Vy*Dt;Pk.Vx*=1-5*Dt;Pk.Vy*=1-5*Dt;
  const Dx=Player.X-Pk.X,Dy=Player.Y-Pk.Y,Dist=Math.hypot(Dx,Dy)||1;
  if(Magnetic||Dist<Stats.PickupRange){const Pull=Magnetic?520:340;Pk.X+=Dx/Dist*Pull*Dt;Pk.Y+=Dy/Dist*Pull*Dt}
  if(Dist<PlayerRadius+4){Coins+=Pk.Value;RunStats.Earned+=Pk.Value;Pk.Value=0;Burst(Player.X,Player.Y,'#ffc857',4,90,.3)}
 }
 Pickups=Pickups.filter(Pk=>Pk.Value>0);
}
function EndWave(){
 Mode='collect';CollectTime=1.6;Enemies=[];EnemyBolts=[];Bolts=[];
 Player.Hp=Math.min(Stats.MaxHp,Player.Hp+Stats.MaxHp*.2);
 ShowBanner('Wave cleared','','#ffc857');
}
function CollectTick(Dt){
 CollectTime-=Dt;
 if(Pickups.length===0||CollectTime<=0){
  for(const Pk of Pickups){Coins+=Pk.Value;RunStats.Earned+=Pk.Value}
  Pickups=[];OpenShop();
 }
}

/* ---------- draw ---------- */
function Poly(X,Y,Radius,Sides,Rot){
 Context.beginPath();
 if(!Sides){Context.arc(X,Y,Radius,0,Tau);return}
 for(let I=0;I<Sides;I++){
  const Angle=Rot+I/Sides*Tau-Math.PI/2;
  Context[I?'lineTo':'moveTo'](X+Math.cos(Angle)*Radius,Y+Math.sin(Angle)*Radius);
 }
 Context.closePath();
}
function Shape(X,Y,Radius,Sides,Rot,Color,Fill){
 Poly(X,Y,Radius,Sides,Rot);Context.fillStyle=Fill||Color+'44';Context.fill();
 Context.strokeStyle=Color;Context.lineWidth=2;Context.stroke();
}
function Draw(){
 Context.setTransform(Dpr,0,0,Dpr,0,0);Context.fillStyle='#0d1020';Context.fillRect(0,0,Width,Height);
 if(!Player){
  Context.strokeStyle='#1a2146';Context.lineWidth=1;Context.beginPath();
  for(let I=0;I<Width;I+=40){Context.moveTo(I,0);Context.lineTo(I,Height)}
  for(let I=0;I<Height;I+=40){Context.moveTo(0,I);Context.lineTo(Width,I)}
  Context.stroke();return;
 }
 const Sx=RandRange(-1,1)*Shake,Sy=RandRange(-1,1)*Shake;
 Context.setTransform(Dpr*Zoom,0,0,Dpr*Zoom,Dpr*(Width/2-Camera.X*Zoom+Sx),Dpr*(Height/2-Camera.Y*Zoom+Sy));
 Context.fillStyle='#10152e';Context.fillRect(0,0,Arena,Arena);
 Context.strokeStyle='#1a2146';Context.lineWidth=1;Context.beginPath();
 for(let I=0;I<=Arena;I+=50){Context.moveTo(I,0);Context.lineTo(I,Arena);Context.moveTo(0,I);Context.lineTo(Arena,I)}
 Context.stroke();
 for(const Dt of Dots){Context.globalAlpha=.25+.2*Math.sin(Time*1.5+Dt.Phase);Context.fillStyle='#4ff0d6';Context.beginPath();Context.arc(Dt.X,Dt.Y,Dt.Size,0,Tau);Context.fill()}
 Context.globalAlpha=1;Context.strokeStyle='#4ff0d6';Context.lineWidth=3;Context.strokeRect(0,0,Arena,Arena);
 for(const Pk of Pickups){
  const Spin=Math.abs(Math.cos(Time*5+Pk.Phase));
  Context.save();Context.translate(Pk.X,Pk.Y+Math.sin(Time*4+Pk.Phase)*2);Context.scale(.25+.75*Spin,1);
  Shape(0,0,5,4,Math.PI/4,'#ffc857','#ffc857');Context.restore();
 }
 for(const En of Enemies){
  if(En.SpawnLeft>0){
   const Progress=1-En.SpawnLeft/En.SpawnTotal;
   Context.globalAlpha=.6;Context.strokeStyle=En.Color;Context.lineWidth=1.5;Poly(En.X,En.Y,En.Radius*(2.2-1.2*Progress),0);Context.stroke();
   Shape(En.X,En.Y,En.Radius*Progress,En.Sides,En.Rot,En.Color);Context.globalAlpha=1;continue;
  }
  const Squash=1+Math.max(0,En.Flash)*2+(En.Kind===0?Math.sin(Time*6+En.X)*.04:0);
  Shape(En.X,En.Y,En.Radius*Squash,En.Sides,En.Rot,En.Color,En.Flash>0?'#ffffff':null);
  if(En.Hp<En.MaxHp){
   Context.fillStyle='#000a';Context.fillRect(En.X-En.Radius,En.Y-En.Radius-9,En.Radius*2,3);
   Context.fillStyle='#ff5d73';Context.fillRect(En.X-En.Radius,En.Y-En.Radius-9,En.Radius*2*En.Hp/En.MaxHp,3);
  }
 }
 for(const Eb of EnemyBolts){
  Context.globalAlpha=.5;Context.strokeStyle='#ff8fd0';Context.lineWidth=2;Context.beginPath();Context.moveTo(Eb.X-Eb.Vx*.04,Eb.Y-Eb.Vy*.04);Context.lineTo(Eb.X,Eb.Y);Context.stroke();
  Context.globalAlpha=1;Shape(Eb.X,Eb.Y,4,0,0,'#ff8fd0','#ff8fd0');
 }
 for(const Bt of Bolts){
  const Color=Bt.Crit?'#ffc857':'#4ff0d6';
  Context.globalAlpha=.5;Context.strokeStyle=Color;Context.lineWidth=3;Context.beginPath();Context.moveTo(Bt.X-Bt.Vx*.03,Bt.Y-Bt.Vy*.03);Context.lineTo(Bt.X,Bt.Y);Context.stroke();
  Context.globalAlpha=1;Shape(Bt.X,Bt.Y,Bt.Crit?4:3,0,0,Color,'#ffffff');
 }
 for(const Pt of Particles){
  const Fade=Pt.Life/Pt.MaxLife;Context.globalAlpha=Fade;
  if(Pt.Ring){Context.strokeStyle=Pt.Color;Context.lineWidth=2;Poly(Pt.X,Pt.Y,Pt.Size*(1-Fade)+3,0);Context.stroke()}
  else{Context.fillStyle=Pt.Color;Context.beginPath();Context.arc(Pt.X,Pt.Y,Pt.Size*(.4+.6*Fade),0,Tau);Context.fill()}
 }
 Context.globalAlpha=1;
 if(Mode!=='dying'&&!(Player.Inv>0&&Math.floor(Player.Inv*24)%2)){
  const Pulse=Math.sin(Time*5)*.8;
  if(Mode==='play'){Context.globalAlpha=.15+.05*Math.sin(Time*3);Context.strokeStyle='#4ff0d6';Context.lineWidth=1;Poly(Player.X,Player.Y,Stats.Range,0);Context.stroke();Context.globalAlpha=1}
  Shape(Player.X,Player.Y,PlayerRadius+Pulse,0,0,'#4ff0d6');
  Shape(Player.X,Player.Y,7,6,Time*1.5,'#4ff0d6','#4ff0d6');
  const BarrelLen=21-Player.Recoil*3;
  Context.strokeStyle='#e8ecff';Context.lineWidth=3;Context.beginPath();
  Context.moveTo(Player.X+Math.cos(Aim)*13,Player.Y+Math.sin(Aim)*13);Context.lineTo(Player.X+Math.cos(Aim)*BarrelLen,Player.Y+Math.sin(Aim)*BarrelLen);Context.stroke();
 }
 Context.font='700 13px "Chakra Petch",sans-serif';Context.textAlign='center';
 for(const Tx of Texts){Context.globalAlpha=Math.min(1,Tx.Life*3);Context.fillStyle=Tx.Color;Context.fillText(Tx.Text,Tx.X,Tx.Y)}
 Context.globalAlpha=1;
 DrawHud();
}
function DrawHud(){
 Context.setTransform(Dpr,0,0,Dpr,0,0);
 if(Player.Inv>.3){Context.fillStyle='#ff5d7326';Context.fillRect(0,0,Width,Height)}
 const BarW=Math.min(Width-40,300),BarX=(Width-BarW)/2,BarY=14+SafeTop;
 Context.fillStyle='#000a';Context.fillRect(BarX,BarY,BarW,14);
 Context.fillStyle='#ffffff88';Context.fillRect(BarX,BarY,BarW*Clamp(HpView/Stats.MaxHp,0,1),14);
 Context.fillStyle=Player.Hp/Stats.MaxHp<.3&&Math.floor(Time*6)%2?'#ffffff':'#ff5d73';Context.fillRect(BarX,BarY,BarW*Clamp(Player.Hp/Stats.MaxHp,0,1),14);
 Context.fillStyle='#4ff0d6';Context.fillRect(BarX,BarY+16,BarW*Clamp(Player.Xp/(12+Player.Level*8),0,1),3);
 Context.fillStyle='#e8ecff';Context.textAlign='center';Context.font='700 12px "Chakra Petch",sans-serif';
 Context.fillText(Math.ceil(Player.Hp)+' / '+Stats.MaxHp,Width/2,BarY+11);
 Context.font='700 17px "Chakra Petch",sans-serif';Context.textAlign='left';Context.fillText('Wave '+Wave,16,BarY+14);
 Context.fillStyle='#4ff0d6';Context.font='700 13px "Chakra Petch",sans-serif';Context.fillText('Lv '+Player.Level,16,BarY+32);
 Context.fillStyle='#ffc857';Context.font='700 17px "Chakra Petch",sans-serif';Context.textAlign='right';Context.fillText('● '+Coins,Width-16,BarY+14);
 Context.fillStyle='#e8ecff';Context.textAlign='center';Context.fillText(Mode==='play'?Math.ceil(WaveTime)+'s':'',Width/2,BarY+40);
 if(ActiveBanner){
  const Progress=ActiveBanner.T/ActiveBanner.Max,Fade=Math.sin(Math.PI*Math.min(1,Progress)),Scale=.85+.15*Math.min(1,Progress*5);
  Context.save();Context.translate(Width/2,Height*.3);Context.scale(Scale,Scale);Context.globalAlpha=Math.min(1,Fade*2.5);
  Context.fillStyle=ActiveBanner.Color;Context.font='700 44px "Chakra Petch",sans-serif';Context.fillText(ActiveBanner.Text,0,0);
  if(ActiveBanner.Sub){Context.fillStyle='#ff5d73';Context.font='700 20px "Chakra Petch",sans-serif';Context.fillText(ActiveBanner.Sub,0,30)}
  Context.restore();Context.globalAlpha=1;
 }
 if(InputMode==='touch'&&(Mode==='play'||Mode==='collect')){
  const X=JoyX(),Y=JoyY(),Alpha=Joy?.9:.45;
  Context.globalAlpha=Alpha*.7;Context.fillStyle='#4ff0d622';Context.strokeStyle='#e8ecff';Context.lineWidth=2;
  Context.beginPath();Context.arc(X,Y,JoyRadius,0,Tau);Context.fill();Context.stroke();
  Context.globalAlpha=Alpha;Context.fillStyle='#4ff0d6';Context.beginPath();Context.arc(X+(Joy?Joy.Dx:0),Y+(Joy?Joy.Dy:0),24,0,Tau);Context.fill();Context.globalAlpha=1;
 }
}
let LastTime=0;
function Loop(Stamp){
 requestAnimationFrame(Loop);
 const Dt=Math.min(.05,(Stamp-LastTime)/1000||0);LastTime=Stamp;
 if(Player){
  UpdateFx(Dt);
  if(Mode==='play'||Mode==='collect'){Update(Dt);if(Mode==='collect')CollectTick(Dt)}
 }
 Draw();
}
ShowMenu();requestAnimationFrame(Loop);
