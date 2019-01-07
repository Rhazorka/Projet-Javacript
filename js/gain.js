// Fonction qui initialisera le rectangle qui representera le volume du son
function initGain(ctx)
{
	ctx.save();
	ctx.fillStyle="rgb(70, 70, 70)";
	ctx.fillRect(wA-30,0,50,hA);
	hRect=hA;
	ctx.restore();
}
// Fonction qui dessine le rectangle representant le volume du sons
function drawGain(ctx)
{
	ctx.save();
	ctx.clearRect(wA-30,0,50,hA);
	ctx.fillStyle="rgb(70, 70, 70)";
	ctx.fillRect(wA-30,0,50,hA);
	ctx.fillStyle="rgb(0, 179, 0)";
	ctx.fillRect(wA-30,hA,50,-hRect);
	ctx.restore();
}