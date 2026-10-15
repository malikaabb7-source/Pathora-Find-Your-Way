(function(root){
const reflect=(d,m)=>m==='/'?[3,2,1,0][d]:[1,0,3,2][d];
function level(number){let seed=number*9349+71;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const n=number<4?6:8;let row=1+Math.floor(rand()*(n-2));const start=row*n;const route=[start],solution={},protectedCells=new Set([start]);let dir=0;
function add(r,c){route.push(r*n+c);protectedCells.add(r*n+c)}
for(let c=1;c<n-1;c++){add(row,c);if(c%2===1){let target=1+Math.floor(rand()*(n-2));if(target===row)target=row===n-2?1:row+1;const vertical=target>row?1:3;solution[row*n+c]=reflect(0,'/')===vertical?'/':'\\';while(row!==target){row+=Math.sign(target-row);add(row,c)}solution[row*n+c]=reflect(vertical,'/')===0?'/':'\\';}}
add(row,n-1);const finish=row*n+n-1;const mirrors={},rocks=[];for(const [id,value]of Object.entries(solution))mirrors[id]=rand()<.5?'/':'\\';for(let id=0;id<n*n;id++)if(!protectedCells.has(id)){if(rand()<.16)rocks.push(id);else if(rand()<.13)mirrors[id]=rand()<.5?'/':'\\';}return{n,start,finish,mirrors,rocks,solution,route};}
function trace(board){let id=board.start,d=0;const path=[id],seen=new Set();for(let i=0;i<board.n*board.n*4;i++){if(id===board.finish)return{path,won:true};const key=id+':'+d;if(seen.has(key))return{path,won:false,reason:'loop'};seen.add(key);if(board.mirrors[id])d=reflect(d,board.mirrors[id]);const r=Math.floor(id/board.n)+[0,1,0,-1][d],c=id%board.n+[1,0,-1,0][d];if(r<0||c<0||r>=board.n||c>=board.n)return{path,won:false,reason:'edge'};id=r*board.n+c;path.push(id);if(board.rocks.includes(id))return{path,won:false,reason:'rock'};}return{path,won:false,reason:'loop'};}
root.EchoEngine={level,trace};if(typeof module!=='undefined')module.exports=root.EchoEngine;
})(globalThis);
