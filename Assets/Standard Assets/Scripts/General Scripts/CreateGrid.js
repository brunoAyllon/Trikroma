﻿#pragma strict

// File from which we read the level
public var dataInputFile: TextAsset;


// When this string is read in thr input file, the object created will be given the default color
public var symbolUseDefault:String;
// Default color for created objects
public var defaultColor = Color.green;

// Object we are going to create (tri, quad, hex, etc)
public var objectToReplicate:GameObject;

// On hold for the custom texture loading stretch goal
/*private var useCustomSprites:boolean;
public var spriteFolderPath:String;
@HideInInspector public var startingSprites : int[,];
public var loadedSprites : Array;*/

/*																													________
 Do we have one turned up and one turned down in an alternating pattern ? For example, for triangles we would have /\/\/\/\/\  
  
 */
public var isAlternating:boolean = true;

// Do we draw the upject upright or upside-down ?
public var startWithUprightObj:boolean = true;

// Number of rows and columns in the game object grid (triangles, quads, etc)
@HideInInspector public var numberOfRows:int;
@HideInInspector public var numberOfColumns:int;

// The color of all the objects in RGB format, stored as a matrix
@HideInInspector public var startingColors: Color[,];

// Material of the object
public var defaultMaterial :Material;

// The individual rederers for each of the created objects, in matrix format
@HideInInspector public var objectRenderer : SpriteRenderer[,];

// What are we parsing at the moment ?
enum DataParse{None, nodeColor, rowsAndColumns};

// Retunrs object location in the grid based on its name
// Observation: Instantiated objects will always have a name in the format <Object Name> <grid position x coordinate> <grid position y coordinate>
public function getObjectPositionFromName(name: String):Vector2
{
	// Sanity check
	if(name != null)
	{
		// Split into 3 fileds: object name, x coordinate and y coordinate
		var iAndj = name.Split(' '[0]);
		// Rerturns the x and y values after reading the strings as ints
		return Vector2( int.Parse(iAndj[1]), int.Parse(iAndj[2]) );
	}
	// In case of an invalid input
	return Vector2(-1, -1);
}

/* Reads the grid from file

Format:
Matrix Size:
<number of rows>, <number of columns>
Color Matrix:
<hex color value of object in position [0][0]>, <hex color value of object in position [0][1]>, <hex color value of object in position [0][2]>.....
<hex color value of object in position [1][0]>, <hex color value of object in position [1][1]>, <hex color value of object in position [1][2]>.....
.......

Observation: ALL values of the declared grid size must be EXPLICITLY written in the file
*/
public function ReadDataFromFile( ):void
{ 	

	// First read all the data
	var allTheText:String[] = dataInputFile.text.Split("\n"[0]);
	
	var dataParseMode:DataParse = DataParse.None;
	var colorMatrixLine:int = -1.0;
	
	// On hold for the custom texture loading stretch goal
	/*var spriteMatrixLine:int = -1.0;
	var spriteFileArrayInitialized:boolean = false;*/
	
	// For each line
	for (currentLine in allTheText)
	{
		
		var data:String[] = currentLine.ToUpper().Replace(" ", "").Split(','[0]);
		
		// Choose parse mode
		if(data[0].Contains("COLORMATRIX:"))
		{
			dataParseMode = DataParse.nodeColor;
		}
		
		// On hold for the custom texture loading stretch goal
		/* else if(data[0].Contains("SPRITEFILES:"))
		{
			if(!spriteFileArrayInitialized)
			{
				loadedSprites = new Array();
				spriteFileArrayInitialized = true;
			}
			useCustomSprites = true;
			dataParseMode = DataParse.spriteFiles;
		}
		else if(data[0].Contains("SPRITEMATRIX:"))
		{
			dataParseMode = DataParse.nodeSprite;
		}*/
		
		
		else if(data[0].Contains("MATRIXSIZE:"))
		{
			dataParseMode = DataParse.rowsAndColumns;
		}
		// In case the user did not switch what kind of data he is parsing in
		else
		{
			switch (dataParseMode)
			{
				// Invalid line
				case DataParse.None:
					Debug.Log("Invalid file format");
					break;
				
				// 	If we already have the number of rows and columns in the grid, read the data 
				case DataParse.nodeColor:
					if(numberOfRows < 0 ||  numberOfColumns < 0)
					{
						Debug.Log("Matrix size not established");
					}
					else
					{
						// Before reading the first line (colorMatrixLine has a value of -1), we initialize the color matrix
						if(colorMatrixLine < 0)
						{
							// Initialize the color matrix
							startingColors = new Color[numberOfRows, numberOfColumns];
							
							// In case the user forgets to give us colors
							for(var color in startingColors)
							{
								// Initialize the color to the default color, such as transparent, white, black, etc
								color = defaultColor;
							}
							// Finished initialization, now we can read line zero
							++colorMatrixLine;
						}
						// Now read the color values from file
						if(colorMatrixLine < numberOfRows)
						{
							for(var j = 0.0; j < numberOfColumns; ++j)
							{
								// Trasform the strings into RGB format
								var rgbColor = HexValueToRGB(data[j]);
								// And store them
								startingColors[colorMatrixLine, j] = rgbColor;
							}
							// Next line
							++colorMatrixLine;
						}			
					}
					break;
					
					// Read the number of rows and columns
					case DataParse.rowsAndColumns:
						// If we have not read them yet
						if(numberOfRows < 0 ||  numberOfColumns < 0)
						{
							// Read the values from the line
							var rowAndColumn = currentLine.Replace(" ", "").Split(','[0]);
							numberOfRows = int.Parse(rowAndColumn[0]);
							numberOfColumns = int.Parse(rowAndColumn[1]);
						}
						else
						{
							Debug.Log("Matrix size was already established, you are trying to do something messed up");
						}
						break;	
						
					// On hold for the custom texture loading stretch goal
					/*case DataParse.spriteFiles:
							var filename:String = ( spriteFolderPath + currentLine ) as String;
							Debug.Log(filename);
							if( AssetDatabase.LoadAssetAtPath(filename, Texture2D) == null)
							{
								Debug.Log("Texture File not found: ");
							}
							else
							{
								Debug.Log(filename + "was loaded");
							}
							loadedSprites.Add( AssetDatabase.LoadAssetAtPath(filename, Texture2D));
							break; 
							
					case DataParse.nodeSprite:
						if(spriteMatrixLine < 0)
						{
							// Initialize the color vector
							startingSprites = new int[numberOfRows, numberOfColumns];
							++spriteMatrixLine;
						}
						//Debug.Log(i);
						//Debug.Log(numberOfRows);
						// Now read the color values from file
						if(spriteMatrixLine < numberOfRows)
						{
							for(var k = 0.0; k < numberOfColumns; ++k)
							{
								startingSprites[spriteMatrixLine, k] = int.Parse(data[k] );
							}
							++spriteMatrixLine;
						}	
						break;	*/				
			} // End switch
		} // End else
	} // End for
}

// Takes a hex value (as a char) and return its corresponding RGB value (as an int)
function HexToInt(hexVal:char):int
{

	// Observation: Could not make one liners with a return statement or the missing break statement would cause Unity to think some code was 
	// "unreachable", so did a longer function to cater to that quirk
	var returnVal:int;
	
	// Default value just in case
	returnVal = 0;
	
	// Choose the appropriate output for the given char
	var hex : char = hexVal;
	switch (hex) 
	{
		case "0":
		
			returnVal = 0;
			break;
		
		case "1":
		
			returnVal = 1;
			break;
		
		case "2":
		
			returnVal = 2;
			break;
		 
		case "3":
		
			returnVal = 3;
			break;
		
		case "4":
		
			returnVal = 4;
			break;
		 
		case "5":
		
			returnVal = 5;
			break;
		 
		case "6":
		
			returnVal = 6;
			break;
		
		case "7":
		
			returnVal = 7;
			break;
		 
		case "8":
		
			returnVal = 8;
			break;
		
		case "9": 
		
			returnVal = 9;
			break;
	 
		case "A":
		
			returnVal = 10;
			break;
		 
		case "B":
		
			returnVal = 11;
			break;
		 
		case "C":
		
			returnVal = 12;
			break;
		 
		case "D": 
		
			returnVal = 13;
			break;
		 
		case "E":
		
			returnVal = 14;
			break;
		 
		case "F":
		
			returnVal = 15;
			break;
	}
	return returnVal;
}

// Transforms a hex value (passed as a string) to an RGB color value
function HexValueToRGB(hexVal:String):Color
{
	var rgbVal: Color;
	
	if(hexVal == symbolUseDefault)
	{
		return defaultColor;
	}
	
	// We must divide the values by 255 to clamp them to valid web safe values
	
	// First 2 chars are the R value 
	rgbVal.r = (HexToInt(hexVal[0]) + HexToInt(hexVal[1]) * 16.000)/255.0;
	// Next 2 are the G value
	rgbVal.g = (HexToInt(hexVal[2]) + HexToInt(hexVal[3]) * 16.000)/255.0;
	// Last 2 are the B value
	rgbVal.b = (HexToInt(hexVal[4]) + HexToInt(hexVal[5]) * 16.000)/255.0;
	
	// Alpha value of 1 by default
	rgbVal.a = 1.0;
	
	return rgbVal;
}

// Creates a grid read from an input file, therefore ReadDataFromFile needs to be called at least once before this can execute
function CreateGrid()
{
	// Do we need to flip the object upside-down ?
	var isUpright:boolean = startWithUprightObj;

	// Basic initialization
	objectRenderer = new SpriteRenderer[numberOfRows, numberOfColumns];
	
	// Some helper values
	var objectWidth = objectToReplicate.renderer.bounds.size.x;
	var objectHeight = objectToReplicate.renderer.bounds.size.y;
	
	var startingX = gameObject.transform.position.x -( numberOfColumns * objectToReplicate.transform.localScale.x)/2.0;
	var startingY = gameObject.transform.position.y + ( numberOfRows * objectToReplicate.transform.localScale.y)/2.0;
	
	var currentPosition = Vector3(startingX, startingY, 0.0);
	var rotationAngle:Quaternion;
	
	var newObjLayer:int = 0;
	
	// Go through every object
	for (var i:int = 0; i < numberOfRows; ++i)
	{
		// Check if the object should be drawn upright or not
		if(i % 2)
		{
			isUpright = !startWithUprightObj;
		}
		else
		{
			isUpright = startWithUprightObj;
		}
		for(var j:int = 0; j < numberOfColumns; ++j)
		{		
			// Decide if we need to flip it upside-down
			if(isUpright)
			{
				rotationAngle = Quaternion.identity;
			}
			else
			{
				rotationAngle =  Quaternion.AngleAxis(180, Vector3.right);
			}
			
			// Create it
			var newObject = Instantiate(objectToReplicate, currentPosition, rotationAngle) as GameObject;
			newObject.name = newObject.name.Replace("(Clone)", " "+i+" "+j);
			// Register the new object as its child
			newObject.transform.parent = gameObject.transform;
			newObject.layer = newObjLayer; 
			
			// Give it the appropriate color and store the renderer so we can change it later
			objectRenderer[i, j] = newObject.GetComponent(SpriteRenderer);
			objectRenderer[i, j].material.color = startingColors[i, j];
			
			// And setup the position of the next object
			if(isAlternating)
			{
				currentPosition.x += objectToReplicate.transform.localScale.x * objectWidth/2.0;
				isUpright = !isUpright;
			}
			else
			{
				currentPosition.x += objectToReplicate.transform.localScale.x * objectWidth;
			}
		}
		// Reset the x position (we are drawing a new line)
		currentPosition.x = startingX;
		
		// Fill from top to bottom(height/2, since the interval is [-width, width] and [-height, height])
		currentPosition.y -= objectToReplicate.transform.localScale.y * objectHeight;
	}
}

// Happens only once, when the  script initializes
function Start () 
{	
	// Variable initialization
	numberOfRows = -1;
	numberOfColumns = -1;
	//useCustomSprites = false;

	// Self explanatory
	ReadDataFromFile();
	CreateGrid();
}

// Might be useful in the future, dunno, no harm in keeping it though
function Update () 
{
	
}