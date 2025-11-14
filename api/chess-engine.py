import chess_engine as engine

def handler(request):
    # delegate to the existing handler in chess_engine.py
    return engine.handler(request)