function initdiiode(ctx) // ctx context du canvas des diiode
{
	ctx.fillStyle="rgb(70, 70, 70)";
	ctx.beginPath();
//Modification de la taille des cercles afin de pour les mettres a l'emplacement choisie	
  	ctx.arc(150, 20, 10, 0, 2 * Math.PI);
  	ctx.arc(75, 20, 10, 0, 2 * Math.PI);
  	ctx.arc(225, 20, 10, 0, 2 * Math.PI);
  	ctx.fill();
  	ctx.restore();
}

function Modifdio(ctx,ecart,side) //ecart = l'ecart entre la frequence du son et celle de la note reconnu 
								  //et side contient une chaine de caractère pour savoir de quel côté allumé la diiode
								  //flat: à gauche  sharp:à gauhche  "": au centre  
{
	ctx.save();
	ctx.clearRect(0,0,300,200);
	if(side=="flat")
	{
		if(ecart>=-15)
		{
			ctx.fillStyle="rgb(0, 150, 0)";
		}
		else if(ecart>=-35)
		{
			ctx.fillStyle="rgb(255, 102, 0)";
		}
		else if(ecart<=-35)
		{
			ctx.fillStyle="rgb(200,0,0)";
		}
		
	}
	else
	{
		ctx.fillStyle="rgb(70, 70, 70)";
	}
	ctx.beginPath();
	//Modification de la taille du cercle afin de pour le mettre a l'emplacement choisie
	ctx.arc(75, 20, 10, 0, 2 * Math.PI);
	ctx.fill();
	
	if(side=="sharp")
	{
		if(ecart<=15)
		{
			ctx.fillStyle="rgb(0, 150, 0)";
		}
		else if(ecart<=35)
		{
			ctx.fillStyle="rgb(255, 102, 0)";
		}
		else if(ecart>=35)
		{
			ctx.fillStyle="rgb(200,0,0)";
		}
	}
	else
	{
		ctx.fillStyle="rgb(70, 70, 70)";
	}
	ctx.beginPath();
	//Modification de la taille du cercle afin de pour le mettre a l'emplacement choisie
	ctx.arc(225, 20, 10, 0, 2 * Math.PI);
	ctx.fill();
  	
  	if(side=="")//ecart>=-1 || ecart<=1
  	{	
  		ctx.fillStyle="rgb(0, 230, 0)"
  	}
  	else
  	{
  		ctx.fillStyle="rgb(70, 70, 70)";
  	}
	ctx.beginPath();
	//Modification de la taille du cercle afin de pour le mettre a l'emplacement choisie
	ctx.arc(150, 20, 10, 0, 2 * Math.PI);
	ctx.fill();
  	ctx.restore();
}