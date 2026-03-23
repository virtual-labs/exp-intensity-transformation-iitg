window.Module = {
  onRuntimeInitialized() {
    initApp();
  }
};

function initApp(){

  const fileInput = document.getElementById("fileInput");
  const chips = document.querySelectorAll(".chip");
  const methodSelect = document.getElementById("methodSelect");
  const gammaSection = document.getElementById("gammaSection");
  const gammaInfo = document.getElementById("gammaInfo");

  const inputCanvas = document.getElementById("inputCanvas");
  const outputCanvas = document.getElementById("outputCanvas");
  const histCanvas = document.getElementById("histCanvas");

  const statusText = document.getElementById("statusText");
  const statusDot = document.getElementById("statusDot");

  let src = null;
  let originalGray = null;

  function setReady(){
    statusText.textContent="OpenCV.js Ready";
    statusDot.style.background="#22c55e";
  }

  function setProcessing(){
    statusText.textContent="Processing...";
    statusDot.style.background="#ef4444";
  }

  function computeHistogram(data){
    const hist=new Array(256).fill(0);
    for(let i=0;i<data.length;i++){
      hist[data[i]]++;
    }
    return hist;
  }

  function drawHistogram(orig,newHist){
    const ctx=histCanvas.getContext("2d");
    histCanvas.width=histCanvas.clientWidth;
    histCanvas.height=220;
    ctx.clearRect(0,0,histCanvas.width,220);

    const max=Math.max(Math.max(...orig),Math.max(...newHist));
    const scale=220/max;
    const bw=histCanvas.width/256;

    ctx.fillStyle="rgba(180,180,180,0.6)";
    for(let i=0;i<256;i++){
      ctx.fillRect(i*bw,220-orig[i]*scale,bw,orig[i]*scale);
    }

    ctx.fillStyle="rgba(96,165,250,0.7)";
    for(let i=0;i<256;i++){
      ctx.fillRect(i*bw,220-newHist[i]*scale,bw,newHist[i]*scale);
    }
  }

  function apply(){

    if(!src) return;

    setProcessing();

    requestAnimationFrame(()=>{

      let gray=new cv.Mat();
      cv.cvtColor(src,gray,cv.COLOR_RGBA2GRAY);

      let dst=new cv.Mat();

      if(methodSelect.value==="negative"){
        cv.bitwise_not(gray,dst);
      }

      if(methodSelect.value==="gamma"){
        const g=parseFloat(document.getElementById("gamma").value);
        gammaInfo.textContent=g<1?"Brightening":g>1?"Darkening":"No change";
        const lut=new cv.Mat(1,256,cv.CV_8U);
        for(let i=0;i<256;i++){
          lut.ucharPtr(0,i)[0]=Math.min(255,Math.pow(i/255,g)*255);
        }
        cv.LUT(gray,lut,dst);
        lut.delete();
      }

      if(methodSelect.value==="stretch"){
        const mm=cv.minMaxLoc(gray);
        gray.convertTo(dst,cv.CV_8U,255/(mm.maxVal-mm.minVal),-mm.minVal*255/(mm.maxVal-mm.minVal));
      }

      let rgba=new cv.Mat();
      cv.cvtColor(dst,rgba,cv.COLOR_GRAY2RGBA);
      cv.imshow(outputCanvas,rgba);

      drawHistogram(
        computeHistogram(originalGray.data),
        computeHistogram(dst.data)
      );

      gray.delete(); dst.delete(); rgba.delete();
      setReady();
    });
  }

  fileInput.addEventListener("change",(e)=>{
    const file=e.target.files[0];
    if(!file) return;
    const img=new Image();
    img.onload=()=>{
      inputCanvas.width=img.width;
      inputCanvas.height=img.height;
      outputCanvas.width=img.width;
      outputCanvas.height=img.height;

      inputCanvas.getContext("2d").drawImage(img,0,0);
      src=cv.imread(inputCanvas);

      originalGray=new cv.Mat();
      cv.cvtColor(src,originalGray,cv.COLOR_RGBA2GRAY);

      cv.imshow(outputCanvas,src);
      drawHistogram(
        computeHistogram(originalGray.data),
        computeHistogram(originalGray.data)
      );

      setReady();
    };
    img.src=URL.createObjectURL(file);
  });

  chips.forEach(chip=>{
    chip.addEventListener("click",()=>{
      chips.forEach(c=>c.classList.remove("active"));
      chip.classList.add("active");
      methodSelect.value=chip.dataset.val;
      gammaSection.style.display=chip.dataset.val==="gamma"?"block":"none";
      apply();
    });
  });

  function bind(r,n){
    const range=document.getElementById(r);
    const num=document.getElementById(n);
    range.addEventListener("input",()=>{num.value=range.value;apply();});
    num.addEventListener("input",()=>{range.value=num.value;apply();});
  }

  bind("gamma","gammaNum");

  document.getElementById("resetBtn").onclick=()=>location.reload();
  document.getElementById("downloadBtn").onclick=()=>{
    const link=document.createElement("a");
    link.download="processed.png";
    link.href=outputCanvas.toDataURL();
    link.click();
  };
  document.getElementById("fullscreenBtn").onclick=()=>{
    document.documentElement.requestFullscreen();
  };

}

