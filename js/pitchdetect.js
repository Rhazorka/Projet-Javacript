/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
 *  Certaines fonctions ne doivent pas être touchée, 
 *  seulement updatePitch qui s'occupe de la partie Canvas
 *  Cela dit, il est conseillé de lire le code et les commentaires
 *  pour comprendre comment le tuner est structuré
 * 
 *  Conseil: S'inspirer de la fonction updatePitch pour créer votre
 *  propre fonction canvas.
 * 
 *  Et enfin, pour votre culture ;) : https://www.deleze.name/marcel/physique/musique/Frequences.pdf
 */

//On créer l'application de fenetre
window.AudioContext = window.AudioContext || window.webkitAudioContext;

//Déclaration des variables
var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var mediaStreamSource = null;
var detectorElem,
	canvasElem,
	waveCanvas,
	pitchElem,
	noteElem,
	detuneElem,
	detuneAmount,
	sliderFrequency;

	// Séparation de l'aiguille et de la diode dans différents canvas	
//Supression de canvas de l'aiguille
var	/*canvasaig,*/outputA,
	Angle = 0; //initialisation de l'angle de l'aiguille

var	canvasdio,
	outputD;

var rafID = null;
var buflen = 1024;
var buf = new Float32Array(buflen);

var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

var MIN_SAMPLES = 0; // will be initialized when AudioContext is created.
var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be

//Lorsque la page web demarre, on invoque la fenêtre d'application
window.onload = function () {
	//On creer le contexte de son
	audioContext = new AudioContext();
	MAX_SIZE = Math.max(4, Math.floor(audioContext.sampleRate / 5000)); // corresponds to a 5kHz signal

	//On récupère les éléments graphiques (HTML) du Tuner
	detectorElem = document.getElementById("detector");
	canvasElem = document.getElementById("output");
	pitchElem = document.getElementById("pitch");
	noteElem = document.getElementById("note");
	detuneElem = document.getElementById("detune");
	detuneAmount = document.getElementById("detune_amt");
	sliderFrequency = document.getElementById("sliderFrequency");

	//canvas aiguille
	//le canvas de l'aiguille a été envelé pour le mettre dans le canvas principale
	canvasElem = document.getElementById("output");
	wA = document.getElementById("output").offsetWidth;
	hA = document.getElementById("output").offsetHeight;
	outputA = canvasElem.getContext('2d');
	background(outputA);
	inittrait(outputA, Angle);

	//canvas diode
	canvasdio = document.getElementById("diiode");
	outputD = canvasdio.getContext('2d');
	initdiiode(outputD);
	//outputA = canvasaig.getContext('2d');

	//Initialisation du Tuner

	detectorElem.ondragenter = function () {
		this.classList.add("droptarget");
		return false;
	};
	detectorElem.ondragleave = function () {
		this.classList.remove("droptarget");
		return false;
	};
	detectorElem.ondrop = function (e) {
		this.classList.remove("droptarget");
		e.preventDefault();
		theBuffer = null;
	};
}

//Fonction qui s'occupe de la partie son et de la modification de sa fréquence
function toggleOscillator() {
	// Lorsqu'on appuie sur le bouton, si le son se jouait
	if (isPlaying) {
		//Le son s'arrete de jouer
		sourceNode.stop(0);
		sourceNode = null;
		analyser = null;
		isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
		window.cancelAnimationFrame(rafID);
		return "play oscillator";
	}
	//Sinon dans le cas inverse, on créer et on joue le son
	sourceNode = audioContext.createOscillator();
	//Slider permettant de changer la fréquence du son
	sliderFrequency.addEventListener('input', function (e) {
		//console.log("Frequence = " + e.target.value + "Hz");
		sourceNode.frequency.setValueAtTime(e.target.value, audioContext.currentTime);
	});
	//On attribue d'autres paramètres au son et on le joue
	analyser = audioContext.createAnalyser();
	analyser.fftSize = 2048;
	sourceNode.connect(analyser);
	analyser.connect(audioContext.destination);
	sourceNode.start(0);
	isPlaying = true;
	//Susceptible d'être modifié si vous creez une nouvelle fonction canvas
	updatePitch();

	return "stop";
}

//Fonction qui attribue la note en fonction de la fréquence
function noteFromPitch(frequency) {
	var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
	return Math.round(noteNum) + 69;
}

//Fonction qui récupère la note dans le tableau déclaré dans les variables plus haut
function frequencyFromNoteNumber(note) {
	return 440 * Math.pow(2, (note - 69) / 12);
}

//Fonction qui permet de dire l'écart entre la fréquence jouée et la fréquence exacte pour que la note soit bien jouée
function centsOffFromPitch(frequency, note) {
	return Math.floor(1200 * Math.log(frequency / frequencyFromNoteNumber(note)) / Math.log(2));
}

//Fonction qui s'occupe de comment gérer l'affichage des notes et de l'écart de fréquence
function autoCorrelate(buf, sampleRate) {
	var SIZE = buf.length;
	var MAX_SAMPLES = Math.floor(SIZE / 2);
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;
	var correlations = new Array(MAX_SAMPLES);

	for (var i = 0; i < SIZE; i++) {
		var val = buf[i];
		rms += val * val;
	}
	rms = Math.sqrt(rms / SIZE);
	if (rms < 0.01) // not enough signal
		return -1;

	var lastCorrelation = 1;
	for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i = 0; i < MAX_SAMPLES; i++) {
			correlation += Math.abs((buf[i]) - (buf[i + offset]));
		}
		correlation = 1 - (correlation / MAX_SAMPLES);
		correlations[offset] = correlation; // store it, for the tweaking we need to do below.
		if ((correlation > GOOD_ENOUGH_CORRELATION) && (correlation > lastCorrelation)) {
			foundGoodCorrelation = true;
			if (correlation > best_correlation) {
				best_correlation = correlation;
				best_offset = offset;
			}
		} else if (foundGoodCorrelation) {
			// short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
			// Now we need to tweak the offset - by interpolating between the values to the left and right of the
			// best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
			// we need to do a curve fit on correlations[] around best_offset in order to better determine precise
			// (anti-aliased) offset.

			// we know best_offset >=1, 
			// since foundGoodCorrelation cannot go to true until the second pass (offset=1), and 
			// we can't drop into this clause until the following pass (else if).
			var shift = (correlations[best_offset + 1] - correlations[best_offset - 1]) / correlations[best_offset];
			return sampleRate / (best_offset + (8 * shift));
		}
		lastCorrelation = correlation;
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate / best_offset;
	}
	return -1;
	//	var best_frequency = sampleRate/best_offset;
}
//Fonction qui va gérer l'affichage des fonctionnalités montrés précedemment
function updatePitch() {
	analyser.getFloatTimeDomainData(buf);
	var ac = autoCorrelate(buf, audioContext.sampleRate);

	var newAngle = angle_frequence(ac); // variable qui changera en fonction de la fréquence
	
	outputA.clearRect(0, 0, wA, hA); // pour effacer l'aiguille quand elle bouge (animation)
	background(outputA);
	inittrait(outputA, newAngle);

	outputD = canvasdio.getContext('2d');
	initdiiode(outputD, ac);

	//S'il n'y a pas de son qui se joue
	if (ac == -1) {
		detectorElem.className = "vague";
		pitchElem.innerText = "--";
		noteElem.innerText = "-";
		detuneElem.className = "";
		detuneAmount.innerText = "--";
	} else {
		//Si du son se joue
		detectorElem.className = "confident";

		//Auto correlation du pitch joué 
		pitch = ac;
		pitchElem.innerText = Math.round(pitch);
		var note = noteFromPitch(pitch);

		//On sélectionne la note correspondante en fonction de la fréquence joué 
		noteElem.innerHTML = noteStrings[note % 12];

		//Gestion des conditions si la fréquence par rapport à une note est exacte ou non
		var detune = centsOffFromPitch(pitch, note);
		if (detune == 0) {
			detuneElem.className = "";
			detuneAmount.innerHTML = "--";
		} else {
			if (detune < 0)
				detuneElem.className = "flat";
			else
				detuneElem.className = "sharp";
			detuneAmount.innerHTML = Math.abs(detune);
		}
		Modifdio(outputD,detune,detuneElem.className);
	}

	// Gestion bug de la partie graphique
	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	rafID = window.requestAnimationFrame(updatePitch);
}