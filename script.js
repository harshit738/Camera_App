let video = document.querySelector("video"); // selecting video tag from html
let vidBtn = document.querySelector("button#record");  // selects record button tag from html
let capBtn = document.querySelector("button#capture");  // selects capture button tag from html
let constraints = {video: true, audio : true};  // constraints which we want to apply while fetching video , can be like video:false, audio:true, etc
let mediaRecorder;      //variable for mediaRecorder
let isRecording = false; // false -> recording nhi ho rhi  .... true -> recording ho rhi hai
let chunks = []; // array which will consist stream or video

let zoomIn = document.querySelector(".zoom-in")
let zoomOut = document.querySelector(".zoom-out")

let body = document.querySelector("body");
let galleryBtn = document.querySelector("button#gallery");
let filters = document.querySelectorAll(".filters");
let filter = "";  // background me color daalne ke liye

galleryBtn.addEventListener("click", function(){
    location.assign("gallery.html");
});

for(let i = 0 ; i < filters.length ; i++){
    filters[i].addEventListener("click", function(e) {
        filter = e.currentTarget.style.backgroundColor;
    
        // remove filter if exists
        removeFilter();

        // apply current filter 
        applyFilter(filter);
    });
}

let minZoom = 1;
let maxZoom = 3;
let currZoom = 1;

zoomIn.addEventListener("click", function() {
    let vidCurrScale = video.style.transform.split("(")[1].split(")")[0];

    if(vidCurrScale > maxZoom) {
        return;
    }
    else {
        currZoom = Number(vidCurrScale) + 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

zoomOut.addEventListener("click", function() {
    if(currZoom > minZoom){
        currZoom -= 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});


// mediaRecorder is a function given by browser to help in recording...

vidBtn.addEventListener("click", function(){

    let innerDiv = vidBtn.querySelector("div");

    if(isRecording){
        mediaRecorder.stop();  // will stop recording 
        isRecording = false;  // will set isRecording to initial state 
        // vidBtn.innerText = "Record"; // innerText change krdega taki pta chale ki record nhi ho rhi hai 
        innerDiv.classList.remove("record-animation");
    }
    else{
        mediaRecorder.start(); // will start recording 
        filter = "";
        removeFilter();
        isRecording = true; // will set isRecording to true state
        // vidBtn.innerText = "Recording..."; // innerText change krdega taki pta chale ki record ho rhi hai 
        video.style.transform = "scale(1)";
        innerDiv.classList.add("record-animation");
    }
});

capBtn.addEventListener("click", function() {
    let innerDiv = capBtn.querySelector("div");
    innerDiv.classList.add("capture-animation");
    setTimeout(function () {
    innerDiv.classList.remove("capture-animation");
  }, 500);
    capture();      // eventListener added to capture button
})

// navigator is an object which is used to control browser (It is given by browser so as to acces apps like camera etc)

// mediaDevices function hai navigator ka jisse hum camera or any other media access krta hai

// mediaDevices ek ''promise function'' hai  
// -> resolves if you allow acces to your media 
// -> rejects if you deny acces to your media

// getUserMedia() function sirf camera access krta hai

// mediaStream is a value returen on resolving mediaDevices() 
// and it contains the stream which camera is seeing

// fir humne video variable jo upar bnaya tha uske srcObject me mediaStream rkh diya taki humari video usme aa jaye 
// agar audio: true rhegi to audio bhi aa jayegi
navigator.mediaDevices               
    .getUserMedia(constraints)
    .then(function (mediaStream) {
        video.srcObject = mediaStream;
        let options = { mimeType: "video/webm; codecs=vp9" }; // this helps is fetching the video in the downloaded file else
                                                                // the video will not be shown -> device dependent
        mediaRecorder = new MediaRecorder(mediaStream, options); 

        mediaRecorder.addEventListener("dataavailable", // inbuilt event of mediaRecorder which will ask the mediaRecoder and if it has data the it will push it into chunks... 
            function(e) {                               // jese hi data zyada ho jata hai ye event trigger hota hai or data chunks me push krdeta hai
                chunks.push(e.data);
        });

        mediaRecorder.addEventListener("stop", function() {
                let blob = new Blob(chunks, { type : "video/mp4"}); // blob saare raw data ko leta hai jo chunks me stored hai and unhe ek large raw file me daal deta hai
                addMedia("video", blob);
                chunks = [];               // jese hi upar wala kaam ho jata hai .. hum chunks ko khali kr denge

                let url = URL.createObjectURL(blob); // this will create an url jisme blob ne jo data bnaya hai wo stored hoga

                let a = document.createElement("a"); // anchor tag create ho jayega
                a.href = url;           // anchor tag ke href me url daal denge
                a.download = "video.mp4";      // download me video.mp4 daal di  
                a.click();          // click krdia taki dowmload ho ske..
                a.remove();
        });


    });

function capture() {
    let c = document.createElement("canvas"); // canvas element created
    c.width = video.videoWidth; // width of that canvas will be equal to width of the video frame
    c.height = video.videoHeight;  // height of that canvas will be equal to height of the video frame

    let ctx = c.getContext("2d");  // creating 2d context or space for canvas
    
    ctx.translate(c.width/2, c.height/2);
    ctx.scale(currZoom, currZoom);
    ctx.translate(-c.width/2, -c.height/2, )
    ctx.drawImage(video, 0, 0);  // on that canvas, the video frame which is available on clicking capture, will be drawn.. 
    
    if(filter != ""){
        ctx.fillStyle = filter;
        ctx.fillRect(0, 0, c.width, c.height);
    }
    
    let a = document.createElement("a"); // anchor tag created
    a.download = "image.jpg";  // download img name
    a.href = c.toDataURL(); // all the data which is present in the canvas in the form if image is converted into URL
    a.click(); // anchor tag is clicked so that the image gets downloaded 
    addMedia("img", a.href);
    a.remove();  // then the anchor tag is remove as its objective is served
}


function applyFilter(filterColor) {
    let filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = filterColor;
    body.appendChild(filterDiv);
}

function removeFilter() {
    let filterDiv = document.querySelector(".filter-div");
    if(filterDiv){
        filterDiv.remove();
    }
}