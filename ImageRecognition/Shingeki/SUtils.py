import os
os.environ['TF_CPP_MIN_LOG_LEVEL']='3'#あのうざったい警告を消す

import cv2
import sys
import os.path
import numpy as np
from PIL import Image, ImageFont, ImageDraw

import keras
from keras.models import *
from keras.layers import *
from keras.applications.vgg16 import VGG16
from keras.utils import np_utils
import numpy
from keras.preprocessing.image import load_img, img_to_array, array_to_img

classes = ["アニ", "アルミン", "エレン", "クリスタ", "コニー", "サシャ", "ジャン", "ベルトルト", "マルコ", "ミカサ", "ライナー", "リヴァイ"]

img_rows, img_cols = 56,56

nb_classes=12

model = None
cascade = cv2.CascadeClassifier("lbpcascade_animeface.xml")

now = None

def buildModel():
    ###VGG16の読み込み
    input_tensor = Input(shape=(img_rows, img_cols, 3))
    vgg16 = VGG16(include_top=False, weights='imagenet', input_tensor=input_tensor)

    # FC層を構築
    top_model = Sequential()
    top_model.add(Flatten(input_shape=vgg16.output_shape[1:]))
    top_model.add(Dense(256, activation='relu'))
    top_model.add(Dropout(0.5))
    top_model.add(Dense(nb_classes, activation='softmax'))

    # VGG16とFCを接続
    model = Model(input=vgg16.input, output=top_model(vgg16.output))

    # 最後のconv層の直前までの層をfreeze
    for layer in model.layers[:15]:
        layer.trainable = False

    model.load_weights('shingeki_weights.h5')

    # Fine-tuningのときはSGDの方がよい
    model.compile(loss='categorical_crossentropy',
                  optimizer=optimizers.SGD(lr=1e-4, momentum=0.9),
                  metrics=['accuracy'])

    return model


def cv2pil(img):
    #BGRからRGBへ変換
    cv2_im = cv2.cvtColor(img,cv2.COLOR_BGR2RGB)
    pil_im = Image.fromarray(cv2_im)
    return pil_im

def im2ary(img):
    #openCVのimageからPILのimageへ
    img = cv2pil(img)
    img = img.resize((img_rows, img_cols), Image.ANTIALIAS)
    x = np.asarray(img, dtype=float)
    x = x.reshape(1, img_rows, img_cols, 3)
    x = x.astype('float32')
    x = x / 255.0

    return x


def predictImage(img, show=True):
    ary = im2ary(img)
    # クラスを予測
    # 入力は1枚の画像なので[0]のみ
    predictions = model.predict(ary)
    pred = predictions[0]
    if show:
        # 予測確率が高いトップ5を出力
        top = 5
        top_indices = pred.argsort()[-top:][::-1]
        result = [(classes[i], pred[i]) for i in top_indices]
        for r in result:
            print(r)

    return np.argmax(predictions)


def text(x, y, str):
    global now
    image = cv2pil(now)
    font = ImageFont.truetype('font.ttf',20, encoding='unic')
    draw = ImageDraw.Draw(image)
    # 日本語の文字を入れてみる
    # 引数は順に「(文字列の左上のx座標, 文字列の左上のy座標)」「フォントの指定」「文字色」
    draw.text((x, y - 10), str, font = font, fill='#FFFFFF')

    now = cv2.cvtColor(np.array(image) , cv2.COLOR_RGB2BGR)


def pr(image, x, y, w, h, pred):
    if pred == 0:
        cv2.rectangle(image, (x, y), (x + w, y + h), (255, 150, 79), 2)
        text(x, y+h, u"アニ")
    if pred == 1:
        cv2.rectangle(image, (x, y), (x + w, y + h), (190, 165, 245), 2)
        text(x, y+h, u"アルミン")
    if pred == 2:
        cv2.rectangle(image, (x, y), (x + w, y + h), (147, 88, 120), 2)
        text(x, y+h, u"エレン")
    if pred == 3:
        cv2.rectangle(image, (x, y), (x + w, y + h), (111, 180, 141), 2)
        text(x, y+h, u"クリスタ")
    if pred == 4:
        cv2.rectangle(image, (x, y), (x + w, y + h), (161, 215, 244), 2)
        text(x, y+h, u"コニー")
    if pred == 5:
        cv2.rectangle(image, (x, y), (x + w, y + h), (112, 255, 12), 2)
        text(x, y+h, u"サシャ")
    if pred == 6:
        cv2.rectangle(image, (x, y), (x + w, y + h), (200, 20, 23), 2)
        text(x, y+h, u"ジャン")
    if pred == 7:
        cv2.rectangle(image, (x, y), (x + w, y + h), (90, 213, 243), 2)
        text(x, y+h, u"ベルトルト")
    if pred == 8:
        cv2.rectangle(image, (x, y), (x + w, y + h), (124, 214, 12), 2)
        text(x, y+h, u"マルコ")
    if pred == 9:
        cv2.rectangle(image, (x, y), (x + w, y + h), (12, 21, 20), 2)
        text(x, y+h, u"ミカサ")
    if pred == 10:
        cv2.rectangle(image, (x, y), (x + w, y + h), (45, 224, 90), 2)
        text(x, y+h, u"ライナー")
    if pred == 11:
        cv2.rectangle(image, (x, y), (x + w, y + h), (114, 25, 244), 2)
        text(x, y+h, u"リヴァイ")
    if pred > 11:
        cv2.rectangle(image, (x, y), (x + w, y + h), (0,0,0), 2)
        text(x, y+h, "Unknown")

def findFace(image, movie=False):
    global now
    now = image
    show = (movie == False)
    image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = cascade.detectMultiScale(image_gray, scaleFactor=1.1, minNeighbors=1, minSize=(24,24))
    if len(faces) > 0:
        for (x, y, w, h) in faces:
            p = predictImage(image[y:y+h, x:x+w], show=show)
            pr(now, x, y, w, h, p)
    elif not movie:
        img = image
        p = predictImage(img, show=show)
        h, w = image_gray.shape[:2]

        pr(image, 0,0, w, h, p)

    return now

model = buildModel()
