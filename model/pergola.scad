$fn = 25;
translate([3, 3, 0]) {
    rotate([130, 0, 0]) {
        difference() {
            cylinder(h=1.2, r=5);
            cylinder(h=1.2, r=4.9);
        }
    }
}
rotate([0,0,-45]) {
// foor
rotate([90, 0, 0]) {
cube([5.6896, 1, 0.038]);
    rotate([0, 90, 0]) {
        cube([2.896, 1, 0.038]);
    }
    translate([5.6896, 0, 0]) {
        rotate([0, 90, 0]) {
            cube([2.896, 1, 0.038]);
        }
    }
}
// wall plane
translate([0, 2.896, 0]) {
    rotate([90,0,0]) {
        difference() {
            // wall
            cube([5.6896, 3.23, 0.038]);
            // window
            translate([0.9, 0.9, 0]) {
                cube([0.7, 1.22, 0.038]);
            }
            // window
            translate([1.8, 0.9, 0]) {
                cube([0.7, 1.22, 0.038]);
            }
            // door
            translate([3.4, 0.0, 0]) {
                cube([0.91, 2.12, 0.038]);
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
/*
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
*/