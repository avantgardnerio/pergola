$psi=.1;
$fn=50;

rotate([0,0,-45]) {
// foor
cube([5.6896, 2.896, 0.038]);
// wall plane
translate([0, 2.896, 0]) {
    rotate([90,0,0]) {
        difference() {
            // wall
            cube([5.6896, 3.23, 0.038]);
            // window
            translate([0.9, 0.9, 0-$psi/2]) {
                cube([0.7, 1.22, 0.038 + $psi]);
            }
            // window
            translate([1.8, 0.9, 0-$psi/2]) {
                cube([0.7, 1.22, 0.038 + $psi]);
            }
            // door
            translate([3.4, 0.0, 0-$psi/2]) {
                cube([0.91, 2.12, 0.038 + $psi]);
            }
        }
    }
}
// head
translate([1.70,2.2,1.5]) {
    sphere(r = 0.09);
}
}
// pergola
intersection() {
    rotate([0,0,-45]) {
        translate([0,0,3.23]) {
            cube([5.6896, 2.8956, 0.152]);
        }
    }
    // slats
    for(i = [0 : 0.304 : 5]) {
        translate([0, i - 5, 4]) {
            rotate([-20,0,0]) {
                cube([10, 2.8956, 0.038]);
            }
        }
    }
}

//sun disk
//max angle 39N in denver.
sunAngle = 39;
rotate([-sunAngle,0,0])
#circle(20);


//$t=0.0;
//animation code
$vpt=[0,0,0]; // look at origin
$vpd=60;      // zoom
//improper euler angle trig calc below, might be good enough
$vpr=[90 - (sunAngle * sin(180 * ($t)) ), 0, 90 - ($t*180)]; 
//overcompensated wrong euler angle
//$vpr=[90 - 1.7*(sunAngle) * sin(180 * $t) * sin(sunAngle), 0, 90 - ($t*180)];




