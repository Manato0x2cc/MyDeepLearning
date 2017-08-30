print("Shingeki.py is starting...")

import keras
from keras.applications.vgg16 import VGG16
from keras.models import *
from keras.layers import Input, Dense, Dropout, Flatten, Activation, Conv2D, MaxPooling2D
from keras import backend as K
from keras.preprocessing.image import ImageDataGenerator
from keras.utils.vis_utils import plot_model
from keras.optimizers import Adam

import os
os.environ['TF_CPP_MIN_LOG_LEVEL']='2'#あのうざったい警告を消す

print("imported all libraries")

img_rows, img_cols = 56,56
batch_size = 32

num_train_images = 1990
num_test_images = 120
nb_classes = 12
epoch = 20

print("loading the datas... Huh? Too lot!!")

### データの読み込み
train_datagen = ImageDataGenerator(
    rescale=1.0 / 255,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True)

test_datagen = ImageDataGenerator(rescale=1.0 / 255)

train_generator = train_datagen.flow_from_directory(
    directory='/dataset/images/train',
    target_size=(img_rows, img_cols),
    color_mode='rgb',
    class_mode='categorical',
    batch_size=batch_size,
    shuffle=True)

test_generator = test_datagen.flow_from_directory(
    directory='/dataset/images/validation',
    target_size=(img_rows, img_cols),
    color_mode='rgb',
    class_mode='categorical',
    batch_size=batch_size,
    shuffle=True)

print("data is loaded... I feel pretty tired")

print("Building a model")
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

output = "/output/"
checkpoint_cb = keras.callbacks.ModelCheckpoint(output+'mnist_mlp_weights8.h5', verbose=0, save_best_only=True)

# Fine-tuningのときはSGDの方がよい
model.compile(loss='categorical_crossentropy',
              optimizer=optimizers.SGD(lr=1e-4, momentum=0.9),
              metrics=['accuracy'])

print("model is generated!")
print("Now to train the model! good luck!")

history = model.fit_generator(
    train_generator,
    steps_per_epoch=num_train_images / batch_size,
    nb_epoch=epoch,
    validation_data=test_generator,
    validation_steps=num_test_images,
    callbacks=[checkpoint_cb]
    )
model.save_weights(output+'mnist_mlp_weights.h5');
save_history(history, os.path.join(output+"result", 'history_smallcnn.txt'))
