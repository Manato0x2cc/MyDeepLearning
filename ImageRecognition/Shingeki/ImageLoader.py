import SUtils
import cv2
import string, random

def find(image, movie=False):
    return SUtils.findFace(image, movie=movie)

if __name__ == '__main__':
    url = input("画像ファイルを入力してください").replace(" ", "")
    #ファイル読み込み
    image = cv2.imread(url)
    i = find(image)
    i.save("./output/output-"+''.join([random.choice(string.ascii_letters + string.digits) for i in range(10)])+".png")
