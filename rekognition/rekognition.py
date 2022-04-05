import csv
import boto3
import sys


def process(path):
    # def process():
    with open('/Users/jeonsumin/PycharmProjects/aws_rekognition_test/aws/new_user_credentials.csv', 'r') as input:
        next(input)
        reader = csv.reader(input)
        for line in reader:
            access_key_id = line[2]
            secret_access_key = line[3]

    folder = "Emotion/"
    photo = folder + str(path)  + '.jpg'

    region = 'ap-northeast-2'
    bucket = "eyetracking-bucket"

    client = boto3.client('rekognition',
                          aws_access_key_id=access_key_id,
                          aws_secret_access_key=secret_access_key,
                          region_name=region)

    response = client.detect_faces(
        Image={
            'S3Object': {
                'Bucket': bucket,
                'Name': photo
            }},
        Attributes=["ALL"]
    )

    resultString = []
    # 두 명 이상의 사람일 때
    for key, value in response.items():

        if key == "FaceDetails":
            for people_att in value:
                # by SooMin START
                emotion_index = (str(people_att).find('Emotions'))
                landmark_index = (str(people_att).find('Landmarks'))
                emotion_result = str(people_att)[emotion_index + 12: landmark_index]

                total_result = emotion_result.split("'Type': ")
                for i in range(1, len(total_result)):
                    total = total_result[i][0:len(total_result[i]) - 4].split(", 'Confidence': ")

                    emotion = total[0].replace("'", "")
                    trust = total[1].replace("}", "")

                    resultString.append(emotion)
                    resultString.append(trust)

    print(resultString)


if __name__ == '__main__':
    process(sys.argv[1])