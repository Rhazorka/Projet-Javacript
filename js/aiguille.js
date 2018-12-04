function inittrait(ctx, A) // A l'angle défini par angle_fréquence(f)
{
	ctx.save();
	ctx.translate(wA / 2, hA - 85);
	ctx.rotate(A);

	ctx.strokeStyle = "rgb(70, 70, 70)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.lineTo(0, -100);
	ctx.stroke();
	ctx.restore();
}

function angle_frequence(f) { // variation de l'angle en fonction de la fréquence émise
	var note = noteFromPitch(f);
	var cents = centsOffFromPitch(f, note);
	var ref_freq = frequencyFromNoteNumber(note);
	var cnorm;
	if (f < ref_freq) {
		cnorm = map(cents, -50, 0, 1, 0.1);
		cnorm = mapLinearToLog(cnorm, 0.1, 1, 0.1, 1);
		Angle = map(cnorm, 1, 0.1, -Math.PI / 2 + 0.2, 0); //angle
		return Angle;
	} else {
		cnorm = map(cents, 0, 50, 0.1, 1);
		cnorm = mapLinearToLog(cnorm, 0.1, 1, 0.1, 1);
		Angle = map(cnorm, 0.1, 1, 0, Math.PI / 2 - 0.2); //angle
		return Angle;
	}
}

// maps a value from [istart, istop] into [ostart, ostop]
function map(value, istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

// passage echelle linéaire -> echelle logarithmique
function mapLinearToLog(x, istart, istop, ostart, ostop) {
	// sliderValue is in [0, 10] range, adjust to [0, 1500] range  
	var value = x;
	var minp = istart;
	var maxp = istop;

	// The result should be between 10 an 1500
	var minv = Math.log(ostart);
	var maxv = Math.log(ostop);

	// calculate adjustment factor
	var scale = (maxv - minv) / (maxp - minp);

	value = Math.exp(minv + scale * (value - minp));
	// end of logarithmic adjustment
	return value;
}