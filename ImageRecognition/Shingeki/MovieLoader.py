#!/usr/bin/python
# -*- coding: utf-8 -*-
import cv2
import ImageLoader as im
import sys
import datetime

from pytube import YouTube


i=0
s=""
def main():
    argv = sys.argv
    if len(argv) > 1:
        if argv[1] == "-youtube":
            url = input("YoutubeのURLを入力してください。")
            yt = YouTube(url)
            name = "download-"+yt.filename
            yt.set_filename(name)
            video = yt.get('mp4')
            video.download("/output/")
            name = "/output/"+name
            print(name)
        else:
            print("Unknown command")
            sys.exit()
    else:
        name = input("動画パスを入力してください。").replace(" ", "")

    #元動画の読み込み
    cap = cv2.VideoCapture(name)
    if not cap.isOpened():
        print("Something wrong...")
        sys.exit()

    retval, frame = cap.read()
    h, w, channels = frame.shape
    # 出力動画の設定
    # 保存ビデオファイルの準備
    # Define the codec and create VideoWriter object
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    rec = cv2.VideoWriter('output.avi', fourcc, 20.0, (w,h))

    # AVIファイルのフレーム数を取得する
    frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    while(cap.isOpened()):
        ret, frame = cap.read()
        if ret == True:
            frame = im.find(frame, movie=True)
            rec.write(frame)

            # 経過を確認するために100フレームごとに経過を出力
            if cap.get(cv2.CAP_PROP_POS_FRAMES)%100 == 0:
                date = datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S")
                print(date + '  現在フレーム数：'+str(int(cap.get(cv2.CAP_PROP_POS_FRAMES)))+' / '+str(frames), "\r", end="")

        else:
            break
    cap.release()
    rec.release()
    cv2.destroyAllWindows()

if __name__ == '__main__':
    main()
