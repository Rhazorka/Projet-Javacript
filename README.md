# Projet-Javacript
#### Membre du groupe : Céline Marin, Julia Bouchoukh et Gautier Devouge
### Présentation du contexte et de l'existant
L’équipe WIMMICS travail sur le projet [Wasabi](http://wasabihome.i3s.unice.fr/) qui est une application qui sera mise à disposition d'écoles de musique. Celle-ci contient une partie avec un [pedalboard](https://wasabi.i3s.unice.fr/dynamicPedalboard/) qui sera exploiter pour l'étude des sons instrumentale. 

L'équipe WIMMICS avait besoin d'intégrer un accordeur au pedalboard. Ils ont développé un plug-in en javascript à partir du code source d'un accordeur d'un autre développeur (Chris Wilson). Celui-ci émet un son (qui correspond à une note) lorsqu'on appuie sur un bouton et on peut faire varier la fréquence du son. En fonction de la fréquence du son, la page web affichera sa fréquence, la note qui correspond et l'écart qu'il y a entre sa fréquence et la fréquence parfaite de la note correspondante. L'équipe a fait appel à nous pour retravailler le GUI(Graphical User Interface) de l'accordeur qu'ils ont développé pour un affichage en aiguille plus ergonomique. 

### Présentation du projet
Le but principal est d'améliorer l'affichage de l'accordeur existant afin qu'il ressemble à un accordeur standard avec une aiguille.
1. afficher une aiguille qui se déplacera vers la gauche ou la droite en fonction de l'écart entre la fréquence du son émit et la fréquence parfaite de la note reconnue
2. garder l'affichage de la note en le minimisant
3. rajouter une diode de couleur qui variera en fonction de l'écart de fréquence entre celle du son émit et la fréquence parfaite de la note reconnue
