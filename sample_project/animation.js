// *******************************************************
// CS 174a Graphics Example Code
// animation.js - The main file and program start point.  The class definition here describes how to display an Animation and how it will react to key and mouse input.  Right now it has 
// very little in it - you will fill it in with all your shape drawing calls and any extra key / mouse controls.  

// Now go down to display() to see where the sample shapes are drawn, and to see where to fill in your own code.

"use strict"
var canvas, canvas_size, gl = null, g_addrs,
	movement = vec2(),	thrust = vec3(), 	looking = false, prev_time = 0, animate = false, animation_time = 0;
		var gouraud = false, color_normals = false, solid = false;
function CURRENT_BASIS_IS_WORTH_SHOWING(self, model_transform) { 
	self.m_axis.draw( self.basis_id++, self.graphicsState, model_transform, new Material( vec4( .8,.3,.8,1 ), .5, 1, 1, 40, "" ) ); 
}

// *******************************************************
// 	M A T E R I A L S
// *******************************************************
// 1st parameter:  Color (4 floats in RGBA format), 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Texture image.
var texture_filenames_to_load = [ "assets/stars.png", "assets/text.png", "assets/text2.png", "earth.gif", "assets/grass.jpg", "assets/strawberry.jpg", "assets/wall.jpg", "assets/floor.jpg", "assets/wood-01.jpg", "assets/wood-02.jpg", "assets/glass.jpg", "assets/smoke.png", "assets/title.png"];
var purplePlastic = new Material( vec4( .9,.5,.9,1 ), .2, .5, .8, 40 ), // Omit the final (string) parameter if you want no texture
greyPlastic = new Material( vec4( .5,.5,.5,1 ), .2, .8, .5, 20 ),
grass = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "assets/grass.jpg" ),
wall = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "assets/wall.jpg" ),
floor = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "assets/floor.jpg" ),
wood1 = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "assets/wood-01.jpg" ),
wood2 = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "assets/wood-02.jpg" ),
clear_glass = new Material( vec4( .69,.878,.902,.5 ), .2, .8, .5, 20 ),
glass = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "assets/glass.jpg" ),
smoke = new Material( vec4( 1,1,1,1 ), .5, 1, 1, 40, "assets/smoke.png" ),
title = new Material( vec4( 0,0,0,1 ), 1, 1, 1, 40, "assets/title.png" ),
strawberry = new Material( vec4( .91,.012,.106,1 ), .5, 1, .5, 40, "assets/strawberry.jpg"),
strawberry_flat = new Material( vec4( .91,.012,.106,1 ), .6, 1, 1, 40),
strawberry_leaves = new Material( vec4( .337,.51,.012,1 ), .6, 1, 1, 40),
teapot = new Material( vec4( .98,.906,.71,1 ), .6, 1, 1, 40),
tea = new Material( vec4( .439,.243,.231,.9 ), 1, 1, 1, 40),
earth = new Material( vec4( .5,.5,.5,1 ), .5, 1, .5, 40, "assets/earth.gif" ),
stars = new Material( vec4( .5,.5,.5,1 ), .5, 1, 1, 40, "assets/stars.png" );

// *******************************************************
// 	M I S C. 
// *******************************************************
var GRND_SIZE = 100;

// Smoke positions
var x = new Array(); 
var y = new Array(); 
var z = new Array();

for(var i=0; i<100; i++){
	x[i]=.5-Math.random(); 
	y[i]=Math.abs(.5-Math.random()); 
	z[i]=-1*Math.abs(.5-Math.random());
}

var song = new Audio("./assets/teapot_song.mp3");


// *******************************************************	
// When the web page's window loads it creates an "Animation" object.  It registers itself as a displayable object to our other class "GL_Context" -- which OpenGL is told to call upon every time a
// draw / keyboard / mouse event happens.

window.onload = function init() {	var anim = new Animation();	}
function Animation()
{
	( function init (self) 
	{
		self.context = new GL_Context( "gl-canvas" );
		self.context.register_display_object( self );
		
		gl.clearColor( .494, .753, .933, 1 );			// Background color
		
		for( var i = 0; i < texture_filenames_to_load.length; i++ )
			initTexture( texture_filenames_to_load[i], true );
		
		self.m_cube = new cube();
		self.m_obj = new shape_from_file( "assets/teapot.obj" )
		self.m_axis = new axis();
		self.m_sphere = new sphere( mat4(), 4, 0 );	
		self.m_bowl = new sphere( mat4(), 4, 1);
		self.m_fan = new triangle_fan_full( 10, mat4() );
		self.m_strip = new rectangular_strip( 1, mat4() );
		self.m_cylinder = new cylindrical_strip( 10, mat4() );
		self.m_pentahedron = new pentahedron();
		self.m_flat_pentahedron = new flat_pentahedron();
		self.m_cup = new cup();
		self.m_triangle = new triangle(mat4());
		self.m_text = new text_line( 30); 
		// 1st parameter is camera matrix.  2nd parameter is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
		self.graphicsState = new GraphicsState( translation(0, -1.5,-8), perspective(45, canvas.width/canvas.height, .1, 1000), 0);

		gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);		gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);		gl.uniform1i( g_addrs.SOLID_loc, solid);
		
		self.context.render();	
	} ) ( this );	
	
	canvas.addEventListener('mousemove', function(e)	{		e = e || window.event;		movement = vec2( e.clientX - canvas.width/2, e.clientY - canvas.height/2, 0);	});
}

// *******************************************************	
// init_keys():  Define any extra keyboard shortcuts here
Animation.prototype.init_keys = function()
{
	shortcut.add( "Space", function() { thrust[1] = -1; } );			shortcut.add( "Space", function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "z",     function() { thrust[1] =  1; } );			shortcut.add( "z",     function() { thrust[1] =  0; }, {'type':'keyup'} );
	shortcut.add( "w",     function() { thrust[2] =  1; } );			shortcut.add( "w",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "a",     function() { thrust[0] =  1; } );			shortcut.add( "a",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "s",     function() { thrust[2] = -1; } );			shortcut.add( "s",     function() { thrust[2] =  0; }, {'type':'keyup'} );
	shortcut.add( "d",     function() { thrust[0] = -1; } );			shortcut.add( "d",     function() { thrust[0] =  0; }, {'type':'keyup'} );
	shortcut.add( "f",     function() { looking = !looking; } );
	shortcut.add( ",",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0,  1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;
	shortcut.add( ".",     ( function(self) { return function() { self.graphicsState.camera_transform = mult( rotation( 3, 0, 0, -1 ), self.graphicsState.camera_transform ); }; } ) (this) ) ;

	shortcut.add( "r",     ( function(self) { return function() { self.graphicsState.camera_transform = mat4(); }; } ) (this) );
	shortcut.add( "ALT+s", function() { solid = !solid;					gl.uniform1i( g_addrs.SOLID_loc, solid);	
																		gl.uniform4fv( g_addrs.SOLID_COLOR_loc, vec4(Math.random(), Math.random(), Math.random(), 1) );	 } );
	shortcut.add( "ALT+g", function() { gouraud = !gouraud;				gl.uniform1i( g_addrs.GOURAUD_loc, gouraud);	} );
	shortcut.add( "ALT+n", function() { color_normals = !color_normals;	gl.uniform1i( g_addrs.COLOR_NORMALS_loc, color_normals);	} );
	shortcut.add( "ALT+a", function() { animate = !animate; } );
	
	shortcut.add( "p",     ( function(self) { return function() { self.m_axis.basis_selection++; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );
	shortcut.add( "m",     ( function(self) { return function() { self.m_axis.basis_selection--; console.log("Selected Basis: " + self.m_axis.basis_selection ); }; } ) (this) );	
}

function update_camera( self, animation_delta_time )
	{
		var leeway = 70, border = 50;
		var degrees_per_frame = .0002 * animation_delta_time;
		var meters_per_frame  = .01 * animation_delta_time;
																					// Determine camera rotation movement first
		var movement_plus  = [ movement[0] + leeway, movement[1] + leeway ];		// movement[] is mouse position relative to canvas center; leeway is a tolerance from the center.
		var movement_minus = [ movement[0] - leeway, movement[1] - leeway ];
		var outside_border = false;
		
		for( var i = 0; i < 2; i++ )
			if ( Math.abs( movement[i] ) > canvas_size[i]/2 - border )	outside_border = true;		// Stop steering if we're on the outer edge of the canvas.

		for( var i = 0; looking && outside_border == false && i < 2; i++ )			// Steer according to "movement" vector, but don't start increasing until outside a leeway window from the center.
		{
			var velocity = ( ( movement_minus[i] > 0 && movement_minus[i] ) || ( movement_plus[i] < 0 && movement_plus[i] ) ) * degrees_per_frame;	// Use movement's quantity unless the &&'s zero it out
			self.graphicsState.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), self.graphicsState.camera_transform );			// On X step, rotate around Y axis, and vice versa.
		}
		self.graphicsState.camera_transform = mult( translation( scale_vec( meters_per_frame, thrust ) ), self.graphicsState.camera_transform );		// Now translation movement of camera, applied in local camera coordinate frame
	}

// *******************************************************	
// display(): called once per frame, whenever OpenGL decides it's time to redraw.

Animation.prototype.display = function(time)
{
	if(!time) time = 0;
	this.animation_delta_time = time - prev_time;
	if(animate) this.graphicsState.animation_time += this.animation_delta_time;
	prev_time = time;
	
	update_camera( this, this.animation_delta_time );
		
	this.basis_id = 0;
	
	var model_transform = mat4();
	

	/**********************************
	Start coding here!!!!
	**********************************/
	var stack = [];
	stack.push(model_transform); 
		
	this.draw_ground(model_transform);
	this.draw_walls(model_transform);
	this.draw_table(model_transform);
	

	// Initial position for teapot - reference point for all objects on table
	model_transform = mult(model_transform, translation(0,1.4,0)); // Position teapot
	stack.push(model_transform); 
	this.draw_berry_bowl(model_transform);

	if(!animate)
	{
		this.draw_teapot(model_transform, false, false);
		stack.push(model_transform);
			model_transform = mult(model_transform, translation(-2,-.9,-2.5)); // Position teacup
			this.draw_cup(model_transform);
		model_transform = stack.pop();

		stack.push(model_transform);
			model_transform = mult(model_transform, translation(0,1.5,1)); // Position title
			model_transform = mult(model_transform, rotation(90,0,1,0)); // Position title
			model_transform = mult(model_transform, rotation(5*Math.sin(time/500),1,0,0)); // Position title
			model_transform = mult(model_transform, scale(5,5,5))
			this.m_strip.draw(this.graphicsState, model_transform, title);
		model_transform = stack.pop();

		stack.push(model_transform);
			model_transform = mult(model_transform, translation(-2.55,-1.07,2.4));
			model_transform = mult(model_transform, scale(.3,.3,.3));
			this.draw_text(model_transform,"Press ALT+A To Start");
		model_transform = stack.pop();

	}

	if(animate)
	{
		var a_time = this.graphicsState.animation_time;
		var a_model_transform = model_transform; // CENTER OF TEAPOT!
		var a_stack = [];
		a_stack.push(a_model_transform);

		// SCENE 1: Translate over strawberries into teacup 
		if(a_time >= 0 && a_time <= 7500){
			this.graphicsState.camera_transform = lookAt( vec3(-6+(a_time/2000),1,2), vec3(-6+(a_time/2000),1,0), vec3(0,1,0) ); 
			a_model_transform = mult(a_model_transform, translation(-2,-.9,-2.5)); // Position teacup
			this.draw_cup(a_model_transform);

			stack.push(model_transform)
				model_transform = mult(model_transform, rotation(-25,0,1,0));
				model_transform = this.draw_teapot(model_transform,false, false);
			model_transform = stack.pop();
		}

		
		// SCENE 2: Teacup hops up to camera
		if (a_time >= 7500 && a_time <= 10810)
		{
			a_model_transform = mult(a_model_transform, translation(-2,-.9,-2.5+((a_time-7500)/1500))); // Position teacup
			a_model_transform = mult(a_model_transform, translation(0,0.085*Math.sin((a_time-7500)/200),0));
			this.draw_cup(a_model_transform);

			stack.push(model_transform)
				model_transform = mult(model_transform, rotation(-25,0,1,0));
				model_transform = this.draw_teapot(model_transform,false, false);
			model_transform = stack.pop();
		}

		// SCENE 3: IT'S MOTHER FUCKING TEA TIME
		if (a_time >= 10810 && a_time <= 12000)
		{
			a_model_transform = mult(a_model_transform, translation(-2,-.98,-2.5+((10850-7500)/1500))); // Position teacup
			this.draw_cup(a_model_transform);
			a_model_transform = mult(a_model_transform, translation(-.5,.6,0));
			a_model_transform = mult(a_model_transform, scale(.1,.1,.1));
			this.draw_text(a_model_transform,"It's TEA TIME!");

			stack.push(model_transform)
				model_transform = mult(model_transform, rotation(-25,0,1,0));
				model_transform = this.draw_teapot(model_transform,false, false);
			model_transform = stack.pop();
		}

		// SCENE 4: Scary pan over to the teapot 
		if(a_time >= 12000 && a_time <= 14000)
		{
			a_model_transform = mult(a_model_transform, translation(-2,-.98,-2.5+((10850-7500)/1500))); // Position teacup
			this.draw_cup(a_model_transform);

			if(a_time >= 12000 && a_time <= 13500)
				this.graphicsState.camera_transform = lookAt( vec3(-3.25+((a_time-12000)/2000),1,2), vec3(0,1.4,0), vec3(0,1,0) );


			stack.push(model_transform)
				model_transform = mult(model_transform, rotation(-25,0,1,0));
				model_transform = this.draw_teapot(model_transform,true, false);

				for(var i = 0; i<=1; i++)
				{
					stack.push(model_transform);
					model_transform = mult(model_transform, translation((i ? -1 : 1)*.3,0,.67));
					model_transform = mult(model_transform, scale(.1,.1,.1));
					model_transform = mult(model_transform, rotation(-0.01625*(a_time-12000),0,1,0));
					this.m_sphere.draw(this.graphicsState, model_transform, floor); // Eyeball
					
					model_transform = mult(model_transform, translation(0,0,.7));
					model_transform = mult(model_transform, scale(.5,.5,.5));
					this.m_sphere.draw(this.graphicsState, model_transform, greyPlastic); // Pupil 	

					model_transform = stack.pop();
				}

			a_model_transform = model_transform;
			a_model_transform = mult(a_model_transform, translation(-.9,.6,1));
			a_model_transform = mult(a_model_transform, scale(.1,.1,.1));
			this.draw_text(a_model_transform,"Come sing with me!");

			model_transform = stack.pop();
			a_model_transform = a_stack.pop();
				
		}

		// BEGIN THE MUSIC!!!!!
 		if(a_time >= 14000)
 			song.play();

		// SCENE 5: Swaying with the music: I'm a little teapot
		if(a_time >= 14000 && a_time <= 24000)
		{
			if(a_time >= 14000 && a_time <= 19000)
				this.graphicsState.camera_transform = lookAt( vec3(0,1,2+(a_time-14000)/2000), vec3(0,1,0), vec3(0,1,0) ); 
			
			stack.push(model_transform);
				model_transform = mult(model_transform, rotation(10*Math.sin((a_time-14000)/500),0,0,1));
				this.draw_teapot(model_transform, false, true);
			model_transform = stack.pop();

			for(var i = 0; i<= 1; i++)
				this.draw_legs(model_transform, i);

			
			a_model_transform = mult(a_model_transform, translation(-1,-.98,1.5));
			a_stack.push(a_model_transform);
				a_model_transform = mult(a_model_transform, rotation(10*Math.sin((a_time-14000)/500),0,0,1));
				this.draw_cup(a_model_transform);
			a_model_transform = a_stack.pop();

			a_stack.push(a_model_transform);
			if(a_time >= 22000 && a_time <= 24000)
			{
				a_model_transform = mult(a_model_transform, translation(.25,1.35,.5));
				a_model_transform = mult(a_model_transform, scale(.1,.1,.1));
				this.draw_text(a_model_transform,"I'm a little teapot");
			}
			a_model_transform = a_stack.pop();
		}

		
		// SCENE 6: Short! and Stout!
		if(a_time >= 24000 && a_time <= 26000)
		{
			this.graphicsState.camera_transform = lookAt( vec3(0,1.3,3), vec3(0,1,0), vec3(0,1,0) );

			if(a_time >= 24000 && a_time <= 25000)
			{
				stack.push(model_transform);
					model_transform = mult(model_transform, translation(-.4,-.7,1));
					model_transform = mult(model_transform, scale(.2,.2,.2));
					this.draw_text(model_transform,"Short!");
				model_transform = stack.pop();

				stack.push(model_transform);
					model_transform = mult(model_transform, scale(1,.5,1));
					model_transform = mult(model_transform, rotation(360*Math.sin((a_time-24000)/700),0,0,1));
					this.draw_teapot(model_transform, false, false);
				model_transform = stack.pop();
				
			}

			if(a_time >= 25000 && a_time <= 26000)
			{
				stack.push(model_transform);
					model_transform = mult(model_transform, translation(-.4,-.7,1));
					model_transform = mult(model_transform, scale(.2,.2,.2));
					this.draw_text(model_transform,"Stout!");
				model_transform = stack.pop();

				stack.push(model_transform);
					model_transform = mult(model_transform, scale(2,.5,1));
					this.draw_teapot(model_transform, false, false);
				model_transform = stack.pop();
			}
		}	

		// SCENE 7: Here's my handle
		if(a_time >= 26000 && a_time <= 28000)
		{
			this.graphicsState.camera_transform = lookAt( vec3(-.9,2,1), vec3(-.9,1.5,0), vec3(0,1,0) );
			this.draw_teapot(model_transform, false, false);

			stack.push(model_transform);
				model_transform = mult(model_transform, translation(-1.5,.4,0)); 
				model_transform = mult(model_transform, scale(.05,.05,.05));
				this.draw_text(model_transform,"Here's my handle");
			model_transform = stack.pop();
		}

		// SCENE 7: Here's my stout
		if(a_time >= 28000 && a_time <= 29000)
		{
			this.graphicsState.camera_transform = lookAt( vec3(.9,2,1), vec3(1,1.5,0), vec3(0,1,0) );
			this.draw_teapot(model_transform, false, false);

			stack.push(model_transform);
				model_transform = mult(model_transform, translation(.8,.48,0)); 
				model_transform = mult(model_transform, scale(.05,.05,.05));
				this.draw_text(model_transform,"Here's my spout");
			model_transform = stack.pop();
		}

		// SCENE 8: 
		if(a_time >= 29000 && a_time <= 32000)
		{
			this.graphicsState.camera_transform = lookAt( vec3(0,2,3.5), vec3(0,0,-2), vec3(0,1,0) );

			stack.push(model_transform);
				model_transform = mult(model_transform, translation(0.02*Math.sin((a_time-29000)/20),0,0));
				model_transform = mult(model_transform, rotation(5*Math.sin((a_time-29000)/100),0,0,1));
				this.draw_teapot(model_transform, false, true);
			model_transform = stack.pop();

			for(var i = 0; i<= 1; i++)
				this.draw_legs(model_transform, i);

			stack.push(model_transform);
				model_transform = mult(model_transform, translation(-1.6,-1,1)); 
				model_transform = mult(model_transform, scale(.15,.15,.15));
				this.draw_text(model_transform,"When I get all steamed up");
			model_transform = stack.pop();
		}

		// SCENE 9:
		if(a_time >= 32000 && a_time <= 34000)
		{
			this.graphicsState.camera_transform = lookAt( vec3(.9,2,2), vec3(1,1.5,0), vec3(0,1,0) );

			stack.push(model_transform);
				model_transform = mult(model_transform, translation(0.02*Math.sin((a_time-29000)/20),0,0));
				model_transform = mult(model_transform, rotation(5*Math.sin((a_time-29000)/100),0,0,1));
				this.draw_teapot(model_transform, false, true);
			model_transform = stack.pop();

			for(var i = 0; i<= 1; i++)
				this.draw_legs(model_transform, i);
			
			stack.push(model_transform);
				model_transform = mult(model_transform, translation(1.1,.4,0)); // Position Smoke
				
				for(i=0;i<40;i++)
				{
			        stack.push(model_transform);
			        model_transform = mult(model_transform, rotation(-90,0,1,0));
			        model_transform=mult(model_transform,translation(
			        	0,
			        	0.5*y[i]*((a_time-32000)/500),
			        	0.5*z[i]*((a_time-32000)/500)));

			        model_transform = mult(model_transform, scale(.1,.1,.1));
			        this.m_strip.draw(this.graphicsState, model_transform, smoke);
			        model_transform=stack.pop();
			    }
				
				model_transform = mult(model_transform, translation(-.15,-.3,1)); 
				model_transform = mult(model_transform, scale(.06,.06,.06));
				this.draw_text(model_transform,"Hear me shout!");

			model_transform = stack.pop();
		}

		// SCENE 10: 
		if(a_time >= 34000 && a_time <= 36000)
		{
			this.graphicsState.camera_transform = lookAt( vec3(0,2,3.5), vec3(0,0,-2), vec3(0,1,0) );
			model_transform = mult(model_transform, rotation(-25,0,1,0));
			model_transform = mult(model_transform, translation(-1,0,0));
			stack.push(model_transform)
				model_transform = mult(model_transform, rotation(-5*(a_time-34000)/500,0,0,1));
				model_transform = this.draw_teapot(model_transform,false, true);
			model_transform = stack.pop();
			for(var i = 0; i<= 1; i++)
			{
				this.draw_legs(model_transform, i);
			}

			model_transform = stack.pop();

			stack.push(model_transform)
				model_transform = mult(model_transform, translation(.5,-.9,.8));
				this.draw_cup(model_transform);
			model_transform = stack.pop();

			stack.push(model_transform);
				model_transform = mult(model_transform, translation(.5,0,0));
				model_transform = mult(model_transform, scale(.2,.2,.2));
				this.draw_text(model_transform,"Tip me over");
			model_transform = stack.pop();
		}

		// SCENE 11
		if(a_time >= 36000 && a_time <=38000)
		{
			this.graphicsState.camera_transform = lookAt( vec3(.9,1,2.5), vec3(1,1,-2), vec3(0,1,0) );

			stack.push(model_transform);
				model_transform = mult(model_transform, scale(.8,.8,.8));
				model_transform = mult(model_transform, translation(.8,-.999,.02));
				for(i=0; i<4; i++)
				{
					model_transform = this.draw_tea(model_transform);
				}
			model_transform = stack.pop();

			model_transform = mult(model_transform, rotation(-25,0,1,0));
			model_transform = mult(model_transform, translation(-1,0,0));
			stack.push(model_transform)
				model_transform = mult(model_transform, rotation(-35,0,0,1));
				model_transform = this.draw_teapot(model_transform,false, true);
			model_transform = stack.pop();
			for(var i = 0; i<= 1; i++)
			{
				this.draw_legs(model_transform, i);
			}

			model_transform = stack.pop();

			stack.push(model_transform)
				model_transform = mult(model_transform, translation(.5,1,0));
				model_transform = mult(model_transform, translation(0,.05*Math.sin((a_time-36000)/200),0));

				model_transform = mult(model_transform, translation(0,-1.9,0));
				this.draw_cup(model_transform);
				
			model_transform = stack.pop();

			model_transform = mult(model_transform, translation(.5,0,0));
			model_transform = mult(model_transform, scale(.2,.2,.2));
			this.draw_text(model_transform,"Pour me out!");
	
		}

		if(a_time >= 38000)
		{
			this.graphicsState.camera_transform = lookAt( vec3(0,1,2+(5000)/2000), vec3(0,1,0), vec3(0,1,0) ); 
			
			stack.push(model_transform);
				model_transform = mult(model_transform, rotation(10*Math.sin((a_time-38000)/500),0,0,1));
				this.draw_teapot(model_transform, false, true);
			model_transform = stack.pop();

			for(var i = 0; i<= 1; i++)
				this.draw_legs(model_transform, i);

			
			a_model_transform = mult(a_model_transform, translation(-1,-.98,1.5));
			a_stack.push(a_model_transform);
				a_model_transform = mult(a_model_transform, rotation(10*Math.sin((a_time-38000)/500),0,0,1));
				this.draw_cup(a_model_transform);
			a_model_transform = a_stack.pop();

			a_stack.push(a_model_transform);

				a_model_transform = mult(a_model_transform, translation(.5,1.3,.5));
				a_model_transform = mult(a_model_transform, scale(.2,.2,.2));
				this.draw_text(a_model_transform,"The End");
			
			a_model_transform = a_stack.pop();

		}

		if(a_time >= 46500)
			song.pause();





	}
}
Animation.prototype.draw_tea = function( model_transform )
{
	var stem_stack = [];
	model_transform = mult( model_transform, rotation(23, 0, 0, 1) );
	model_transform = mult( model_transform, translation( 0, .13, 0 ) );
	stem_stack.push(model_transform);
		model_transform = mult( model_transform, scale( .1, .3, .1) );
		this.m_cube.draw(this.graphicsState, model_transform, tea);
	model_transform = stem_stack.pop();
	model_transform = mult( model_transform, translation( 0, .13, 0 ) );

	return model_transform;
}	

Animation.prototype.draw_text = function(model_transform, text)
{
	model_transform = mult(model_transform, rotation(-90,0,1,0));
	this.m_text.set_string(text);
	this.m_text.draw(this.graphicsState, model_transform, false, vec4(0,0,0,1));
}

Animation.prototype.draw_berry_bowl = function(model_transform)
{
	var stack = [];
	model_transform = mult(model_transform, translation(-4,-.82,0)); // Position bowl	
	stack.push(model_transform); // CENTER OF BOWL
		model_transform = mult(model_transform, translation(0,-.23,0));
		model_transform = mult(model_transform, rotation(45,0,1,0));
		model_transform = mult(model_transform, rotation(-60,1,0,0));
		this.draw_berry(model_transform, strawberry);
		
	model_transform = stack.pop();

	stack.push(model_transform); // CENTER OF BOWL
		model_transform = mult(model_transform, translation(0,-.23,0));
		model_transform = mult(model_transform, rotation(-45,0,1,0));
		model_transform = mult(model_transform, rotation(-60,1,0,0));
		this.draw_berry(model_transform, strawberry_flat);
		//CURRENT_BASIS_IS_WORTH_SHOWING(this,model_transform);
	model_transform = stack.pop();

	this.draw_bowl(model_transform);
}

Animation.prototype.draw_berry = function(model_transform, texture)
{
	model_transform = mult(model_transform, scale(.3,.3,.3));
	this.m_pentahedron.draw(this.graphicsState, model_transform, texture);
	this.m_flat_pentahedron.draw(this.graphicsState, model_transform, strawberry_leaves);
}

Animation.prototype.draw_bowl = function(model_transform)
{
	model_transform = mult(model_transform, rotation(-90,1,0,0));
	model_transform = mult(model_transform, scale(.7,.7,.28));
	this.m_bowl.draw(this.graphicsState, model_transform, clear_glass);
}
Animation.prototype.draw_cup = function(model_transform)
{
	var stack = [];
	this.m_cup.draw(this.graphicsState, model_transform, glass);
	
	for(var i = 0; i<=1; i++)
	{
		stack.push(model_transform);
		model_transform = mult(model_transform, translation((i ? -1 : 1)*.21,.1,.24));
		model_transform = mult(model_transform, scale(.05,.05,.05));
		this.m_sphere.draw(this.graphicsState, model_transform, greyPlastic); // Pupil 
		model_transform = stack.pop();
	}

	model_transform = mult(model_transform, translation(0,0,.3));
	model_transform = mult(model_transform, rotation(45,0,0,1));
	model_transform = mult(model_transform, scale(.1,.1,.1));
	this.m_triangle.draw(this.graphicsState,model_transform,greyPlastic); // Mouth
}

Animation.prototype.draw_pupils = function(model_transform, i)
{
	model_transform = mult(model_transform, translation((i ? -1 : 1)*.3,0,.67));
	model_transform = mult(model_transform, scale(.1,.1,.1));
	this.m_sphere.draw(this.graphicsState, model_transform, floor); // Eyeball
	
	model_transform = mult(model_transform, translation(0,0,.7));
	model_transform = mult(model_transform, scale(.5,.5,.5));
	this.m_sphere.draw(this.graphicsState, model_transform, greyPlastic); // Pupil 	
}

Animation.prototype.draw_legs = function(model_transform, i)
{
	model_transform = mult(model_transform, translation((i ? -1 : 1)*.3,-.72,0));
	model_transform = mult(model_transform, scale(.07,.7,.07));
	model_transform = mult(model_transform, rotation(90,1,0,0));
		this.m_cylinder.draw(this.graphicsState, model_transform, greyPlastic); // Legs
	model_transform = mult(model_transform, rotation(-90,1,0,0));
	model_transform = mult(model_transform, scale(1/.07,1/.7,1/.07));
	
	model_transform = mult(model_transform, translation(0,-.35,.1));
	model_transform = mult(model_transform, scale(.15,.1,.3));
	this.m_sphere.draw(this.graphicsState, model_transform, greyPlastic); // Shoes
}

Animation.prototype.draw_teapot = function (model_transform, animate_eyes, animate_body) {
	var stack = [];
	stack.push(model_transform); // STORE AT CENTER OF TEAPOT
	model_transform = mult(model_transform, scale(.014,.014,.014));
	this.m_obj.draw(this.graphicsState,model_transform,teapot);
	model_transform = stack.pop(); // MODEL TRANSFORM AT CENTER OF TEAPOT
	
	for(var i = 0; i<=1; i++)
	{
		stack.push(model_transform);
		stack.push(model_transform); // CENTER
		if(animate_eyes != true)
			this.draw_pupils(model_transform, i);
		model_transform = stack.pop(); // RETURN TO CENTER

		if (animate_body != true)
			this.draw_legs(model_transform, i);
		model_transform = stack.pop();
	}

	stack.push(model_transform);
	model_transform = mult(model_transform, translation(0,-0.25,.78));
	model_transform = mult(model_transform, rotation(45,0,0,1));
	model_transform = mult(model_transform, scale(.15,.15,.15));
	this.m_triangle.draw(this.graphicsState,model_transform,greyPlastic); // Mouth
	model_transform = stack.pop();

	return model_transform; 

}

Animation.prototype.draw_table = function (model_transform) {
	var center = model_transform;

	model_transform = mult(model_transform, scale(12,.5,6));
	this.m_cube.draw(this.graphicsState,model_transform,wood2);

	model_transform = center; 
	
	for(var j = 0; j <= 1; j++)
	{
		for(var i = 0; i <= 1; i++)
		{
			model_transform = mult( model_transform, translation( (i ? -1 : 1)*5.5, -2.5, (j ? -1: 1)*2.5 ) );
			model_transform = mult(model_transform, scale(1,5,.5));
				this.m_cube.draw(this.graphicsState,model_transform,wood1);
			model_transform = center; 
		}
	}
}

Animation.prototype.draw_ground = function( model_transform )
{
	model_transform = mult( model_transform, translation( 0, -5, 0 ) );
	model_transform = mult( model_transform, scale( GRND_SIZE, GRND_SIZE, GRND_SIZE) ); // Expand the ground
	model_transform = mult( model_transform, rotation(90, 0, 0, 1) ); // Rotate along z-axis
	this.m_strip.draw( this.graphicsState, model_transform, grass);				// Rectangle
}

Animation.prototype.draw_walls = function(model_transform)
{
	var center = model_transform;
	// SIDE WALLS
	for(var i = -1; i <= 1; i++)
	{
		if(i == 0)
			continue;
		model_transform = mult(model_transform, translation(i*10,5,0));
		model_transform = mult(model_transform, scale(10,20,15));
			this.m_strip.draw(this.graphicsState, model_transform, wall);	
		model_transform = center; 
	}
	// FLOOR/CEILING
	for(i = 0; i <= 1; i++)
	{
		model_transform = mult(model_transform, translation(0,(i ? -4.9 : 15),0));
		model_transform = mult(model_transform, scale(20,20,15));
		model_transform = mult(model_transform, rotation(90,0,0,1));
			this.m_strip.draw(this.graphicsState, model_transform, (i ? floor : new Material(vec4(.961,.914,.863,1),.2, 1, 1, 40)));
		model_transform = center;
	}
	
	// BACK WALL
	model_transform = mult(model_transform, translation(0,11,-7.5));
	model_transform = mult(model_transform, scale(20,8,15));
	model_transform = mult(model_transform, rotation(90,0,1,0));
		this.m_strip.draw(this.graphicsState, model_transform, wall);

	model_transform = center;
	model_transform = mult(model_transform, translation(0,3.5,-7.5));
	model_transform = mult(model_transform, scale(20,7,15));
	model_transform = mult(model_transform, rotation(90,0,1,0));
		this.m_strip.draw(this.graphicsState, model_transform, clear_glass);

	model_transform = center;
	model_transform = mult(model_transform, translation(0,-2.5,-7.5));
	model_transform = mult(model_transform, scale(20,5,15));
	model_transform = mult(model_transform, rotation(90,0,1,0));
		this.m_strip.draw(this.graphicsState, model_transform, wall);

}

Animation.prototype.update_strings = function( debug_screen_strings )		// Strings this particular class contributes to the UI
{
	//debug_screen_strings.string_map["time"] = "Animation Time: " + this.graphicsState.animation_time/1000 + "s";
	debug_screen_strings.string_map["frame_rate"] = "Frame rate: " + 1000/this.animation_delta_time;
	debug_screen_strings.string_map["animate"] = "Animation " + (animate ? "on" : "off") ;
	
}