@echo off
echo === Chilli API Server ===
echo Installing packages...
py -m pip install flask pillow numpy tensorflow flask-cors

echo Starting API server...
echo Visit: http://127.0.0.1:5000
echo POST /predict with image file
py app.py
pause
