export interface ISpeakerIdentity {
    status: string,
    createdDateTime: Date,
    lastActionDateTime: Date,
    processingResult: {
        identifiedProfileId: string,
        confidence: string
    }
}
