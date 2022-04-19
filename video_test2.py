import boto3, json, sys, time

class VideoDetect:
    jobId = 'null' # 비디오 분석 작업용 ID, 작업 식별자
    access_key_id = ''
    secret_access_key = ''
    rek = boto3.client('rekognition', region_name='ap-northeast-2', aws_access_key_id=access_key_id, aws_secret_access_key=secret_access_key)
    sqs = boto3.client('sqs', region_name='ap-northeast-2', aws_access_key_id=access_key_id, aws_secret_access_key=secret_access_key)
    sns = boto3.client('sns', region_name='ap-northeast-2', aws_access_key_id=access_key_id, aws_secret_access_key=secret_access_key)

    roleArn = 'arn:aws:iam::805057381367:role/serviceRekognition'
    bucket = 'allonsybuckets'
    video = 'avengers.mp4'
    startJobId1 = 'null'
    startJobId2 = 'null'
    startJobId3 = 'null'

    sqsQueueUrl = 'https://sqs.ap-northeast-2.amazonaws.com/805057381367/allonsySQS'
    snsTopicArn = 'arn:aws:sns:ap-northeast-2:805057381367:allonsySNS'
    processType = 'null'

    def __init__(self, role, bucket, video):
        self.roleArn = role
        self.bucket = bucket
        self.video = video

    def GetSQSMessageSuccess(self):
        jobFound = False
        succeeded = False
        dotLine = 0
        while jobFound == False:
            sqsResponse = self.sqs.receive_message(QueueUrl=self.sqsQueueUrl, MessageAttributeNames=['ALL'], MaxNumberOfMessages=10)
            if sqsResponse:
                if 'Messages' not in sqsResponse:
                    if dotLine < 40:
                        #print('.', end='')
                        dotLine = dotLine + 1
                        time.sleep(0.5)
                    else:
                        #print()
                        dotLine = 0
                    sys.stdout.flush()
                    continue

                for message in sqsResponse['Messages']:
                    notification = json.loads(message['Body'])
                    rekMessage = json.loads(notification['Message'])
                    jobFound = True
                    if (rekMessage['Status'] == 'SUCCEEDED'):
                        succeeded = True
                    self.sqs.delete_message(QueueUrl=self.sqsQueueUrl, ReceiptHandle=message['ReceiptHandle'])
                    # Delete the unknown message. Consider sending to dead letter queue
                    self.sqs.delete_message(QueueUrl=self.sqsQueueUrl, ReceiptHandle=message['ReceiptHandle'])
        return succeeded

    def GetLabelDetectionResults(self, second):
        genreList = []
        second = int(second/1000)
        maxResults = 10
        paginationToken = ''
        finished = False
        sf = ['Aircraft', 'Sky','Sunrise','Overwatch','Universe','Space']
        adventure = ['Train','Vehicle','Transportation','Nature']
        fscount = 0 # 3 이상되면 sf 장르로 분류
        adventurecount = 0
        while finished == False:
            response = self.rek.get_label_detection(JobId=self.startJobId1, MaxResults=maxResults,
                                                    NextToken=paginationToken, SortBy='TIMESTAMP') # 시간순으로 정렬, SortBy TIMESTAMP

            for labelDetection in response['Labels']:
                if labelDetection['Timestamp']/1000>=5:
                    last = second-5

                    if int(labelDetection['Timestamp']/1000)<=second+5 and int(labelDetection['Timestamp']/1000)>=last:
                        label = labelDetection['Label']
                        if label['Name'] in sf:
                            fscount+=1
                        if label['Name'] in adventure:
                            adventurecount+=1
                    else:
                        continue

            if 'NextToken' in response:
                paginationToken = response['NextToken']
            else:
                finished = True

        if(fscount>=3):
            genreList.append('sf')
        if (adventurecount >= 3):
            genreList.append('adventure')
        print(genreList)

    def GetFaceDetectionResults(self,second):
            second = int(second / 1000)
            emotionList = []
            maxResults = 10
            paginationToken = ''
            finished = False

            while finished == False:
                response = self.rek.get_face_detection(JobId=self.startJobId2, MaxResults=maxResults, NextToken=paginationToken)

                for faceDetection in response['Faces']:
                    if faceDetection['Timestamp'] / 1000 >= 5:
                        last1 = second - 5

                        if int(faceDetection['Timestamp'] / 1000) <= second + 5 and int(faceDetection['Timestamp'] / 1000) >= last1:
                            if str((faceDetection['Face']['Emotions'][0])["Type"]) not in emotionList:
                                emotionList.append(str((faceDetection['Face']['Emotions'][0])["Type"]))
                        else:
                            continue

                if 'NextToken' in response:
                    paginationToken = response['NextToken']
                else:
                    finished = True
            print(emotionList)

    def CreateTopicandQueue(self):

        millis = str(int(round(time.time() * 1000)))

        # Create SNS topic
        snsTopicName = "AmazonRekognitionExample" + millis

        topicResponse = self.sns.create_topic(Name=snsTopicName)
        self.snsTopicArn = topicResponse['TopicArn']

        # create SQS queue
        sqsQueueName = "AmazonRekognitionQueue" + millis
        self.sqs.create_queue(QueueName=sqsQueueName)
        self.sqsQueueUrl = self.sqs.get_queue_url(QueueName=sqsQueueName)['QueueUrl']

        attribs = self.sqs.get_queue_attributes(QueueUrl=self.sqsQueueUrl, AttributeNames=['QueueArn'])['Attributes']

        sqsQueueArn = attribs['QueueArn']

        # Subscribe SQS queue to SNS topic
        self.sns.subscribe(
            TopicArn=self.snsTopicArn,
            Protocol='sqs',
            Endpoint=sqsQueueArn)

        # Authorize SNS to write SQS queue
        policy = """{{
  "Version":"2012-10-17",
  "Statement":[
    {{
      "Sid":"MyPolicy",
      "Effect":"Allow",
      "Principal" : {{"AWS" : "*"}},
      "Action":"SQS:SendMessage",
      "Resource": "{}",
      "Condition":{{
        "ArnEquals":{{
          "aws:SourceArn": "{}"
        }}
      }}
    }}
  ]
}}""".format(sqsQueueArn, self.snsTopicArn)

        response = self.sqs.set_queue_attributes(
            QueueUrl=self.sqsQueueUrl,
            Attributes={
                'Policy': policy
            })

    def DeleteTopicandQueue(self):
        self.sqs.delete_queue(QueueUrl=self.sqsQueueUrl)
        self.sns.delete_topic(TopicArn=self.snsTopicArn)

    def StartDetection(self):
        # 사물 인식 아이디 발급
        response1 = self.rek.start_label_detection(Video={'S3Object': {'Bucket': self.bucket, 'Name': self.video}},
                                                  NotificationChannel={'RoleArn': self.roleArn,
                                                                       'SNSTopicArn': self.snsTopicArn})
        self.startJobId1 = response1['JobId']

        # 감정 인식 아이디 발급
        response2 = self.rek.start_face_detection(Video={'S3Object': {'Bucket': self.bucket, 'Name': self.video}},
                                                 NotificationChannel={'RoleArn': self.roleArn,
                                                                      'SNSTopicArn': self.snsTopicArn},
                                                 FaceAttributes='ALL')
        self.startJobId2 = response2['JobId']

        # 유명인 인식 아이디 발급
        response3 = self.rek.start_celebrity_recognition(
            Video={'S3Object': {'Bucket': self.bucket, 'Name': self.video}},
            NotificationChannel={'RoleArn': self.roleArn, 'SNSTopicArn': self.snsTopicArn})
        self.startJobId3 = response3['JobId']

    def GetCelebrityDetectionResults(self,second):
        second = int(second / 1000)
        maxResults = 10
        paginationToken = ''
        finished = False
        celeblist = []
        while finished == False:
            response = self.rek.get_celebrity_recognition(JobId=self.startJobId3, MaxResults=maxResults,NextToken=paginationToken)

            for celebrityRecognition in response['Celebrities']:
                if celebrityRecognition['Timestamp']/1000>=2:
                    last = second-2
                    if int(celebrityRecognition['Timestamp']/1000)<=second+2 and int(celebrityRecognition['Timestamp']/1000)>=last:
                        if str(celebrityRecognition['Celebrity']['Name']) not in celeblist:
                            name = str(celebrityRecognition['Celebrity']['Name'])
                            celeblist.append(name)
                    else:
                        continue
            if 'NextToken' in response:
                paginationToken = response['NextToken']
            else:
                finished = True
        print(celeblist)

def main():
    roleArn = 'arn:aws:iam::805057381367:role/serviceRekognition'
    bucket = 'allonsybuckets'
    video = 'avengers.mp4'

    analyzer = VideoDetect(roleArn, bucket, video)
    analyzer.CreateTopicandQueue()

    analyzer.StartDetection()
    if analyzer.GetSQSMessageSuccess() == True:
        analyzer.GetLabelDetectionResults(25000)  # 25초에 사용자 감정의 폭 Max
        analyzer.GetCelebrityDetectionResults(72333)  # 72초에 사용자 감정의 폭 Max
        analyzer.GetFaceDetectionResults(72333) # 72초에 사용자 감정의 폭 Max

    analyzer.DeleteTopicandQueue()

if __name__ == "__main__":
    main()
