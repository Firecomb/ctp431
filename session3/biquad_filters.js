
// Buffer source
var demo_buffer = null;
var loopPlayBack = false;
var sourceNode = null;
var filePlayOn = false;

// Biquad filter default
var biquad_params = {
	type : "lowpass",
	frequency : 1000,
	Q : 4,
	gain: 1
}


var filter_types = [
	"lowpass",
	"highpass",
    "bandpass",
	"lowshelf",
	"highshelf",
	"peaking",
	"notch",
	"allpass"
];


var context;
var biquad;


// Amp response plot
var canvas = null;
var WIDTH = 640;
var HEIGHT = 320;

var numFreqs = 200;
var magResponse = new Float32Array(numFreqs); // magnitude
var phaseResponse = new Float32Array(numFreqs);  // phase
var freqBins = new Float32Array(numFreqs);


window.onload=function(){
	
	// select a filter
	var filterSelect = document.getElementById("filtersDropdown");
	for (var i in filter_types) {
		var option = document.createElement("option");
		option.text = filter_types[i];
		option.value = filter_types[i];
		filterSelect.appendChild(option);
	}
	filterSelect.addEventListener("change", changeFilterType, false);

	var demoAudio = document.getElementById("playButton");
	demoAudio.addEventListener("click", playSound, false);


	// link filter GUI parameters to biquaFilter node
	var freqSlider = document.getElementById("frequencySlider");
	biquad_params.frequency = freqSlider.value;
	freqSlider.addEventListener("change", changeFilterFreq, false);

	var qSlider = document.getElementById("qSlider");
	biquad_params.Q = qSlider.value;
	qSlider.addEventListener("change", changeFilterQ, false);

	var gainSlider = document.getElementById("gainSlider");
	biquad_params.gain = gainSlider.value;
	gainSlider.addEventListener("change", changeFilterGain, false);
	
	// get convas to plot amp response
	canvas = document.getElementById("amp_response");				
	canvas.width =  WIDTH;
	canvas.height = HEIGHT;


	var demoReq = new XMLHttpRequest();
    demoReq.open("Get","NiGiD_-_Gentle_Joy.mp3",true);
    demoReq.responseType = "arraybuffer";
    demoReq.onload = function(){
        context.decodeAudioData(demoReq.response, function(buffer){demo_buffer = buffer;});
    }
    demoReq.send();

    // create audio context and node
	context = new AudioContext();
 	biquad= context.createBiquadFilter();

 	for(var i = 0; i < numFreqs; ++i) {
   		freqBins[i] = context.sampleRate/2*(i+1)/numFreqs;
	}


	updateFilter();	
}


function changeFilterType(e){
	var filterName = e.target.value;		
	biquad_params.type = filterName;		
	updateFilter(); 		
}

function changeFilterFreq(e){
	var filterFreq = e.target.value;		
	biquad_params.frequency = filterFreq;		
	updateFilter(); 		
}

function changeFilterQ(e){
	var filterQ = e.target.value;		
	biquad_params.Q = filterQ;		
	updateFilter(); 		
}

function changeFilterGain(e){
	var filterGain = e.target.value;		
	biquad_params.gain = filterGain;		
	updateFilter(); 		
}

// update filter parameters
function updateFilter() {		
	// update filter parameters
	biquad.type = biquad_params.type;
	biquad.frequency.value  = biquad_params.frequency ;
	biquad.Q.value = biquad_params.Q;
	biquad.gain.value = biquad_params.gain;
	
	// update filter plot
	drawFrequencyResponse();		
}

// plot amplitude response	  	  
function drawFrequencyResponse() {
	var drawContext = canvas.getContext("2d");		

	// fill rectangular
	drawContext.fillStyle = 'rgb(200, 200, 200)';
	drawContext.fillRect(0, 0, WIDTH, HEIGHT);
	
    var barWidth = WIDTH / numFreqs;

    // get magnitude response
	biquad.getFrequencyResponse(freqBins, magResponse, phaseResponse);

    drawContext.strokeStyle = "black";
    drawContext.beginPath();
    for(var frequencyStep = 0; frequencyStep < numFreqs; ++frequencyStep) {
		drawContext.lineTo(frequencyStep * barWidth, HEIGHT - magResponse[frequencyStep]*HEIGHT/2);
    }
    drawContext.stroke();
} 


function playSound() {
    if (filePlayOn) {
    	stopAudio();
    	return;
    }

    sourceNode = context.createBufferSource();

    sourceNode.buffer = demo_buffer;

	sourceNode.connect(biquad);
	biquad.connect(context.destination);
	sourceNode.start(0);
    sourceNode.loop = loopPlayBack;

	filePlayOn = true;
	
	var demoAudio = document.getElementById("playButton");
	demoAudio.innerHTML = 'Stop'
}

function stopAudio() {
	var demoAudio = document.getElementById("playButton");
	demoAudio.innerHTML = 'Play'
	sourceNode.stop(0);
    sourceNode = null;
    filePlayOn = false;
}

function toggleLoopPlay() {
	if ( loopPlayBack ) {
		loopPlayBack = false;
	}
	else {
		loopPlayBack = true;
	}		
}	
