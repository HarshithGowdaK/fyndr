import math


class RankingService:
    @staticmethod
    def haversine_distance(lat1, lon1, lat2, lon2):
        R = 6371  # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dlon / 2) * math.sin(dlon / 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c
        return distance



    @staticmethod
    def calculate_cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
        # Assumes vectors are normalized
        if not vec1 or not vec2:
            return 0.0
        return sum(a * b for a, b in zip(vec1, vec2))

    @staticmethod
    def calculate_hybrid_score(similarity_score: float, distance_km: float, text_score: float = 0.0) -> float:
        """
        Rank = (Visual Sim * w1) + (Proximity Score * w2) + (Text Score * w3)
        Proximity Score: Inverse of distance. Caps at 1.0 if distance is near 0.
        """
        # Normalize distance: simple decay. 
        # If distance is 0, score is 1. If distance is 100km, score is much lower.
        proximity_score = 1.0 / (1.0 + distance_km * 0.1) 
        
        if text_score > 0:
            # If text match is present, give it significant weight
            # Visual: 50%, Text: 30%, Proximity: 20%
            hybrid = (similarity_score * 0.5) + (text_score * 0.3) + (proximity_score * 0.2)
        else:
            # Original: Visual 70%, Proximity 30%
            hybrid = (similarity_score * 0.7) + (proximity_score * 0.3)
            
        return hybrid

ranking_service = RankingService()
