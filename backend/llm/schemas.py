from ninja import Schema

class AnalysisResponse(Schema):
    analysis: str


class SmartSearchRequest(Schema):
    prompt: str
    limit: int = 10
