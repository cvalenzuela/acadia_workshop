#include "main.h"
#include "Cells.h"
#include "gl2ps.h"

float unitX = 1;
float unitY = 1;

#define Res 10
#define MaxTrail 500
#define MaxParticles 150
#define MaxTargets 8
float dirLength;
float cellsColor[Res*Res];

double timeStep = 0.3;
double targetStrength = 0.001;
double gravityStrength = 0.0;
double spinStrength = 0.01;
double dragStrength = 0.2;
double collisonStrength = 0.1;
double collisonRadius = 8;
double magneticStrength = 2;
double chemicalStrength = 0;
double chemicalRadius = 0;

float charges[MaxTargets];
float AttRep = -1;
vec gravity(0, 0, -1);

Cells mycells[Res*Res];
vec chemicalForce[MaxParticles][Res*Res];
float dist[MaxTargets];
vec dir[MaxTargets];
vec target[MaxTargets];
vec pos[MaxParticles];
vec vel[MaxParticles];
vec forces[MaxParticles];
vec trail[MaxParticles][MaxTrail];
vec chemF[MaxParticles];
vec cellCenterPt[Res * Res];

int trailCounter = 0;
int distanceCounter = 0;
int frm = 0;

float min, max;

string seq = "Sequence: ";

SliderGroup S;
ButtonGroup B;

bool run = false;

/// METHODS

// PARTICLE to PARTICLE FORCES

vec PtoP(int particleId1, int particleId2)
{
	float distance = pos[particleId1].distanceTo(pos[particleId2]);
	vec dir = pos[particleId2] - pos[particleId1];

	vec collisionForce(0, 0, 0);
	if (distance < collisonRadius)
	{
		collisionForce = dir * AttRep;
		collisionForce.normalise();
	}
		
	return collisionForce;

}


//EXTERNAL FORCES

//gravity
void applyGravity()
{
	for (int i = 0; i < MaxParticles; i++)
	{
		forces[i] += gravity * gravityStrength;
	}

}


//magnetic force
void applyMagneticForce()
{
	for (int i = 0; i < MaxParticles; i++)
	{
		for (int j = 0; j < MaxTargets; j++)
		{
			float distance = pos[i].distanceTo(target[j]);
			
			vec dir = target[j] - pos[i];
			dir.normalise();

			vec f = (dir * magneticStrength * charges[j]) / ((distance + 0.01) * (distance + 0.01));
			f.normalise();
			forces[i] += f * 0.1;
		}
	}
}


// spin force
void applySpinForce()
{
	for (int i = 0; i < MaxParticles; i++)
	{
		for (int j = 0; j < MaxTargets; j++)
		{
			float distance = pos[i].distanceTo(target[j]);

			vec dir = target[j] - pos[i];
			dir.normalise();

			vec UpVec(0, 0, 1);

			vec spinDir = dir.cross(UpVec);

			forces[i] += spinDir * spinStrength; // forces[i] = forces[i] + dir
		}
	}
}


// drag force
void applyDragForce()
{
	for (int i = 0; i < MaxParticles; i++)
	{
		vec dragDir = vel[i] * -1;

		forces[i] += dragDir * dragStrength;
	}

}


//chemical force
void cellAttForce()
{
	for (int i = 0; i < MaxParticles; i++)
	{
		chemF[i] = vec(0,0,0);

		
		for (int j = 0; j < Res * Res; j++)
		{
			cellCenterPt[j] = mycells[j].p + vec(unitX / 2, unitY / 2, 0);
			vec dist = cellCenterPt[j] - pos[i];
			float distance = dist.mag();
			dist.normalise();

			if (distance < chemicalRadius)
			{
				//chemF[i] += (pos[i] - cellCenterPt[j]).normalise() * mycells[j].chemicalA;
				chemF[i] += dist * mycells[j].chemicalA;
			}

			else continue;
		}

		forces[i] += (chemF[i] / float(Res * Res)).normalise() * chemicalStrength;
	}

}

//INTEGRATE
void integrateForces()
{
	for (int i = 0; i < MaxParticles; i++)
	{
		vec acc = forces[i] / 1; // acceleration = force /mass
		vec newVel = vel[i] + acc * timeStep; // new vel = old vel + acc * timestep
		vec newPos = pos[i] + newVel * timeStep; // new pos =  old position + newVelocity*timestep

		// update values
		pos[i] = newPos;
		vel[i] = newVel;
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void updateFunction()
{
	// deposit chemical 
	/*for (int i = 0; i < MaxParticles; i++)
	{
		int dx;
		int dy;
		dx = floor(pos[i].x / unitX);
		dy = floor(pos[i].y / unitY);


		int id = dx * Res + dy;
		if (id >= 0 && id < Res * Res)
			mycells[id].chemicalA += 10;
	}*/



	// find min max of chemical A ;

	/*min = 100000000;
	max = -1 * min;

	for (int i = 0; i < Res * Res; i++)
	{
		min = MIN(mycells[i].chemicalA, min);
		max = MAX(mycells[i].chemicalA, max);
	}*/

	//printf(" min %1.2f, max %1.2f \n", min, max);

	//resetforces
	for (int i = 0; i < MaxParticles; i++)
	{
		forces[i] = vec(0, 0, 0);
	}

	// calculate particle to particle forces
	for (int i = 0; i < MaxParticles; i++)
	{
		for (int j = i + 1; j < MaxParticles; j++)
		{
			if (i == j) continue;

			vec PtoPForce = PtoP(i, j);

			forces[i] += PtoPForce * collisonStrength;
			forces[j] += PtoPForce * collisonStrength * -1;
		}
	}

	// CALCULATE FORCES

	//target force
	for (int i = 0; i < MaxParticles; i++)
	{
		float leastD = -100000;
		int idofTargets;
		int idofParticles = i;

		for (int j = 0; j < MaxTargets; j++)
		{
			float dist = pos[i].distanceTo(target[j]);
			if (dist > leastD)
			{
				leastD = dist;
				idofTargets = j;
			}
		}
		vec p = pos[idofParticles];
		vec dir = target[idofTargets] - p;
		dir.normalise();
		float dirLength = dir.mag();

		if (dirLength < 10)
		{
			forces[i] += dir * targetStrength;
		}
		else continue;
	}

	//applyGravity();
	//cellAttForce();
	applyDragForce();
	applySpinForce();
	applyMagneticForce();
	


	// Update position or integration of forces
	integrateForces();


	//update trail
	for (int i = 0; i < MaxParticles; i++)
	{
		trail[i][0] = pos[i]; // put the current position of particle into first place of myTrail array

		for (int j = MaxTrail - 1; j >= 1; j--)  // shift the other elements in the array
		{
			trail[i][j] = trail[i][j - 1];
		}
	}

	frm++;

}

void setup()
{
	backGround(0,0,0,0);

	// initialise points/particles & velocity
	for (int i = 0; i < MaxParticles; i++)
	{
		vel[i] = vec(0, 0, 0);
		pos[i] = vec(ofRandom(-100, 100), ofRandom(-100, 100), 0);
	}

	for (int i = 0; i < MaxTargets; i++)
	{
		target[0] = vec(-100, 0, 0);
		target[1] = vec(-50, -50, 0);
		target[2] = vec(0, -100, 0);
		target[3] = vec(+50, -50, 0);
		target[4] = vec(+100, 0, 0);
		target[5] = vec(-50, +50, 0);
		target[6] = vec(0, +100, 0);
		target[7] = vec(-50, +50, 0);



	}

	for (int i = 0; i < MaxTargets; i++)
	{


		charges[0] = +1;
		charges[1] = -1;
		charges[2] = +1;
		charges[3] = -1;
		charges[4] = +1;
		charges[5] = -1;
		charges[6] = +1;
		charges[7] = -1;

	}

	//for (int i = 0; i < Res; i++)
	//{
	//	for (int j = 0; j < Res; j++)
	//	{
	//		int id = i * Res + j;
	//		mycells[id].p = vec(unitX*i, unitY*j, 0);
	//		mycells[id].unitX = unitX;
	//		mycells[id].unitY = unitY;
	//		mycells[id].chemicalA = 0.0;
	//	}
	//}

	S = *new SliderGroup();
	B = *new ButtonGroup(vec(50, 500, 0));

	B.addButton(&run, "run");

	S.addSlider(&timeStep, "timeStep");
	S.sliders[0].minVal = 0.01;
	S.sliders[0].maxVal = 1.00;

	S.addSlider(&gravityStrength, "gravityStrength");
	S.sliders[1].minVal = 0.00;
	S.sliders[1].maxVal = 10.00;

	S.addSlider(&targetStrength, "targetStrength");
	S.sliders[2].minVal = 0.00;
	S.sliders[2].maxVal = 10.00;

	S.addSlider(&spinStrength, "spinStrength");
	S.sliders[3].minVal = 0.00;
	S.sliders[3].maxVal = 1.00;

	S.addSlider(&dragStrength, "dragStrength");
	S.sliders[4].minVal = 0.00;
	S.sliders[4].maxVal = 10.00;

	S.addSlider(&collisonStrength, "collisonStrength");
	S.sliders[5].minVal = 0.00;
	S.sliders[5].maxVal = 10.00;

	S.addSlider(&collisonRadius, "collisonRadius");
	S.sliders[6].minVal = 0.01;
	S.sliders[6].maxVal = 100.00;

	S.addSlider(&magneticStrength, "magneticStrength");
	S.sliders[7].minVal = 0.01;
	S.sliders[7].maxVal = 10.00;

	S.addSlider(&chemicalStrength, "chemicalStrength");
	S.sliders[8].minVal = 0.00;
	S.sliders[8].maxVal = 10.00;

	S.addSlider(&chemicalRadius, "chemicalRadius");
	S.sliders[9].minVal = 0.00;
	S.sliders[9].maxVal = 20.00;

}

void update(int value)
{
	if (run)updateFunction();
}

void draw()
{
	
	glEnable(GL_POINT_SMOOTH);

	S.draw();
	B.draw();

	for (int i = 0; i < MaxParticles; i++)
	{
		glPointSize(3);
		vec4 color = getColour(i, 0, MaxParticles);
		glColor3f(255,255,255);
		drawPoint(pos[i]);
	}

	glColor3f(1, 0, 0);

	for (int i = 0; i < MaxTargets; i++)
	{
		drawPoint(target[i]);
	}

	for (int i = 0; i < MaxParticles; i++)
	{
		int end = frm % MaxTrail;
		if (MaxTrail < frm) end = MaxTrail;
		int trailNum = MaxTrail;

		for (int j = 0; j < end-1; j++)
		{
			float val = ofMap(i, 0, MaxParticles, 0, 1);
			float valTrail = ofMap(j, 0, end, 0, 255);

			glColor4f(0, val, valTrail, valTrail);
			glPointSize(0.3);
			//drawPoint(trail[i][j]);
			drawLine(trail[i][j], trail[i][j + 1]);
		}
	}

	/*for (int j = 0; j < Res * Res; j++)
	{
		glPointSize(5);
		vec4 clr = getColour(mycells[j].chemicalA, min,max);
		glColor3f(clr.r,clr.g,0);
		drawRectangle(mycells[j].p, mycells[j].p + vec(unitX, unitY, 0));
	}*/

	setup2d();
	glColor3f(0, 0, 0);
	drawString(seq, 50, 600);
	restore3d();

}

void keyPress(unsigned char k, int xm, int ym)
{
	if (k == 't')
	{
		seq += "t";
	}

	if (k == 'v')
	{
		seq += "v";
		for (int i = 0; i < MaxTargets; i++)
		{
			charges[i] *= -1;
		}
	}

	if (k == 'c')
	{
		seq += "c";
		AttRep *= -1;
	}

	if (k == 's')
	{
		setup();
	}

	if (k == 't')
	{
		topCamera();
	}

	if (k == 'w')
	{
		for (int i = 0; i < MaxTargets; i++)
		{
			target[i] = vec(ofRandom(-100, 100), ofRandom(-100, 100), 0);
		}
	}

	if (k == 'A') // to print high res EPS image
	{
		FILE *fp;
		int state = GL2PS_OVERFLOW, buffsize = 0;
		fp = fopen("out.eps", "w");
		printf("Writing 'out.eps'... ");

		while (state == GL2PS_OVERFLOW)
		{
			buffsize += winW * winH;
			gl2psBeginPage("test", "gl2psTestSimple", NULL, GL2PS_EPS, GL2PS_SIMPLE_SORT,
				GL2PS_USE_CURRENT_VIEWPORT,
				GL_RGBA, 0, NULL, 0, 0, 0, buffsize, fp, "out.eps");

			draw();

			state = gl2psEndPage();
		}

		fclose(fp);
		printf("Done!\n");

	}

	if (k == 'u')
	{
		updateFunction();
	}
}

void mousePress(int b, int s, int x, int y)
{
	if (GLUT_LEFT_BUTTON == b && GLUT_DOWN == s)
	{
		S.performSelection(x, y, HUDSelectOn);
		B.performSelection(x, y);
	}

}

void mouseMotion(int x, int y)
{
	S.performSelection(x, y, HUDSelectOn);
}