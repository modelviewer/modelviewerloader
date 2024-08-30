# How to use modelviewerloader with modelviewer

1. <strong>Clone or fork this repository</strong>

2. <strong>Generate a personal access token.</strong> It is recommended to use a fine-grained token with permissions set to only read/write the modelviewerloader repository. You can generate the token [here](https://github.com/settings/apps)

3. <strong>Provide your Github username and generated token</strong> inside both the modelviewerloader and modelviewer applications

You can either host the Model Viewer Loader yourself (e.g., using GitHub Pages) or access it [here](https://modelviewerloader.netlify.app/)
<br/>
Model Viewer application can be downloaded [here](https://github.com/Fuyutami/modelviewer)
<br/>
## Model Viewer F.A.Q.
1.  **Model not visible after loading?** <br/>
Ensure your Wi-Fi connection is stable and all project geometry in AutoCAD is converted to MESH.<br/>
2.  **Model scale or location incorrect?** <br/>
Verify that units are set correctly in AutoCAD.
3.  **Is the model taking too long to load?** <br/>
To improve loading times, try reducing the size of your DXF file. When converting objects to MESH in AutoCAD using the MESHOPTIONS command, aim to decrease the polygon count. This will help the model load faster. Keep in mind that loading speed can also be affected by your Wi-Fi connection.
