import io
import tkinter as Tkinter

import keras
from keras.models import *
import numpy
from keras.preprocessing.image import load_img, img_to_array, array_to_img
from PIL import Image, ImageOps

model = None
b1 = "up"
xold, yold = None, None
def models():
    json_file = open('mnist_mlp_model.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()

    global model
    model = model_from_json(loaded_model_json)
    model.load_weights('mnist_mlp_weights.h5')

def main():
    root = Tkinter.Tk()
    root.title(u"Mnist App")
    root.geometry("500x280")

    label = Tkinter.Label(root, text=u"数字を書いてください！")
    label.pack()
    label.place(x=280,y=100)

    def erase(event):
        canvas.delete("data")

    def mnist(event):
        ps = canvas.postscript(colormode='color')
        img = Image.open(io.BytesIO(ps.encode('utf-8')))
        img = img.convert('L')
        img = img.resize((28, 28), Image.ANTIALIAS)
        img = ImageOps.invert(img)
        x = np.asarray(img, dtype=float)
        x = x.reshape(1, 28, 28, 1)
        x = x.astype('float32')
        x = x / 255

        predict = model.predict_classes(x, batch_size=32, verbose=1)
        print("予測ラベル: ", predict)

        label["text"]= u"うーん...これは"+str(predict[0])+u"ですかね...?"

        

    def b1down(event):
        global b1
        b1 = "down"

    def b1up(event):
        global b1, xold, yold
        b1 = "up"
        xold = None           # reset the line when you let go of the button
        yold = None

    def motion(event):
        if b1 == "down":
            global xold, yold
            if xold is not None and yold is not None:
                event.widget.create_line(xold,yold,event.x,event.y,width=8, smooth=True,tag="data")
                          # here's where you draw it. smooth. neat.
            xold = event.x
            yold = event.y


    canvas = Tkinter.Canvas(root, width = 280, height = 280)
    canvas.place(x=0, y=0)

    canvas.bind("<Motion>", motion)
    canvas.bind("<ButtonPress-1>", b1down)
    canvas.bind("<ButtonRelease-1>", b1up)

    button_draw = Tkinter.Button(root, text=u'判定',width=10)
    button_draw.bind("<Button-1>",mnist)
    button_draw.place(x=320,y=200)

    # 「消す」ボタン
    button_draw = Tkinter.Button(root, text=u'消す',width=10)
    button_draw.bind("<Button-1>",erase)
    button_draw.place(x=320,y=240)

    root.mainloop()

if __name__ == '__main__':
    models()
    main()
