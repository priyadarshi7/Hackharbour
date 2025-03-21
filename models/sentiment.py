import requests
import json
import os
import time
import schedule
import nltk
import pandas as pd
import re
import emoji
from datetime import datetime, timedelta
from collections import Counter
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import matplotlib.pyplot as plt
import base64
from io import BytesIO
from jinja2 import Template
import math
import random

# Download required NLTK resources
nltk.download('vader_lexicon', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

# Configuration
API_ENDPOINT = 'http://localhost:4000/api/comment/all-with-products'
REPORT_DIRECTORY = './reports'
SENTIMENT_ANALYZER = SentimentIntensityAnalyzer()
LEMMATIZER = WordNetLemmatizer()
STOP_WORDS = set(stopwords.words('english'))

# Keywords dictionaries for emotion detection
EMOTION_KEYWORDS = {
    'joy': ['happy', 'great', 'excellent', 'love', 'awesome', 'amazing', 'fantastic', 'thrilled', 'delighted', 'glad', 'enjoy', 'pleased'],
    'anger': ['angry', 'terrible', 'awful', 'horrible', 'hate', 'furious', 'annoyed', 'irritated', 'frustrating', 'bad', 'worst'],
    'sadness': ['sad', 'disappointed', 'unhappy', 'poor', 'regret', 'miss', 'unfortunate', 'depressed', 'upset', 'sorry'],
    'surprise': ['unexpected', 'surprised', 'wow', 'unbelievable', 'incredible', 'astonishing', 'shocked', 'sudden', 'startled'],
    'satisfaction': ['satisfied', 'good', 'fine', 'decent', 'okay', 'ok', 'content', 'sufficient', 'adequate', 'acceptable'],
    'frustration': ['frustrating', 'confusing', 'difficult', 'complex', 'challenging', 'hard', 'complicated', 'impossible', 'struggling'],
    'confusion': ['confused', 'unclear', 'ambiguous', 'weird', 'strange', 'puzzling', 'perplexing', 'misleading', 'vague'],
    'anticipation': ['looking forward', 'excited', 'anticipate', 'await', 'eager', 'expecting', 'hope', 'prospect']
}

# Keywords for feature-related feedback
FEATURE_KEYWORDS = {
    'usability': ['easy', 'intuitive', 'simple', 'straightforward', 'user-friendly', 'accessible', 'convenient', 'effortless', 'complicated', 'confusing'],
    'performance': ['fast', 'slow', 'quick', 'speedy', 'responsive', 'lag', 'efficient', 'performance', 'loading', 'crash', 'bug', 'glitch'],
    'design': ['beautiful', 'ugly', 'design', 'look', 'interface', 'ui', 'clean', 'messy', 'cluttered', 'modern', 'outdated', 'layout'],
    'reliability': ['stable', 'unstable', 'reliable', 'unreliable', 'consistent', 'inconsistent', 'dependable', 'solid', 'fragile', 'breaks', 'error'],
    'value': ['expensive', 'cheap', 'worth', 'value', 'overpriced', 'affordable', 'cost', 'price', 'quality', 'money'],
    'security': ['secure', 'insecure', 'safe', 'privacy', 'protection', 'vulnerable', 'hack', 'breach', 'trust', 'confidential'],
    'support': ['support', 'help', 'assistance', 'service', 'responsive', 'customer service', 'answer', 'resolve', 'solution', 'respond'],
    'features': ['feature', 'functionality', 'capability', 'option', 'setting', 'tool', 'function', 'ability', 'missing', 'lacking']
}

# Ensure reports directory exists
if not os.path.exists(REPORT_DIRECTORY):
    os.makedirs(REPORT_DIRECTORY, exist_ok=True)

def get_report_filename(date_str=None):
    """Generate the report filename for a given date (defaults to today)"""
    if date_str is None:
        date_str = datetime.now().strftime('%Y-%m-%d')
    return f"sentiment_report_{date_str}.json"

def load_today_report():
    """Load existing report if it exists for today, otherwise create a new one"""
    report_path = os.path.join(REPORT_DIRECTORY, get_report_filename())
    if os.path.exists(report_path):
        with open(report_path, 'r') as f:
            return json.load(f)
    return {
        'date': datetime.now().strftime('%Y-%m-%d'),
        'analyses': [],
        'productSummaries': {},
        'overallSentiment': None,
        'totalComments': 0,
        'insights': [],
        'keywords': {},
        'sentimentTrend': {'timestamps': [], 'values': []},
        'emotionDistribution': {},
        'featureFeedback': {},
        'allCommentTimestamps': [],
        'commentVolume': {'hours': [0] * 24, 'days': [0] * 7}
    }

def preprocess_text(text):
    """Preprocess text for analysis"""
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)
    
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Tokenize
    tokens = word_tokenize(text)
    
    # Remove stopwords and lemmatize
    tokens = [LEMMATIZER.lemmatize(token) for token in tokens if token not in STOP_WORDS]
    
    return ' '.join(tokens), tokens

def extract_keywords(tokens, min_length=3):
    """Extract keywords from preprocessed tokens"""
    return [token for token in tokens if len(token) >= min_length]

def analyze_sentiment(text, rating=None):
    """Perform advanced sentiment analysis on comment text"""
    # Preprocess text
    processed_text, tokens = preprocess_text(text)
    
    # Basic VADER sentiment analysis
    vader_scores = SENTIMENT_ANALYZER.polarity_scores(text)
    
    # Extract keywords
    keywords = extract_keywords(tokens)
    
    # Convert compound score to -1 to 1 range
    basic_score = vader_scores['compound']
    
    # Advanced sentiment analysis
    sentiment = {
        'score': basic_score,
        'label': 'neutral',
        'vaderScores': vader_scores,
        'keywords': keywords[:10]  # Top 10 keywords
    }
    
    # Classify sentiment
    if basic_score > 0.5:
        sentiment['label'] = 'very positive'
    elif basic_score > 0:
        sentiment['label'] = 'positive'
    elif basic_score == 0:
        sentiment['label'] = 'neutral'
    elif basic_score > -0.5:
        sentiment['label'] = 'negative'
    else:
        sentiment['label'] = 'very negative'
    
    # Emotion detection
    emotions = {emotion: 0 for emotion in EMOTION_KEYWORDS.keys()}
    
    # Check for emotion keywords
    for emotion, keywords in EMOTION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in processed_text:
                emotions[emotion] += 1
    
    # Feature feedback detection
    feature_feedback = {feature: 0 for feature in FEATURE_KEYWORDS.keys()}
    
    # Check for feature-related keywords
    for feature, keywords in FEATURE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in processed_text:
                feature_feedback[feature] += 1
    
    # Find dominant emotion
    dominant_emotion = max(emotions.items(), key=lambda x: x[1])
    if dominant_emotion[1] > 0:
        sentiment['dominantEmotion'] = dominant_emotion[0]
        sentiment['emotions'] = emotions
    
    # Find dominant feature feedback
    dominant_feature = max(feature_feedback.items(), key=lambda x: x[1])
    if dominant_feature[1] > 0:
        sentiment['dominantFeature'] = dominant_feature[0]
        sentiment['featureFeedback'] = feature_feedback
    
    # Emoji analysis
    emojis_in_text = [c for c in text if c in emoji.EMOJI_DATA]
    sentiment['emojiCount'] = len(emojis_in_text)
    sentiment['emojis'] = emojis_in_text
    
    # Text statistics
    sentiment['textStats'] = {
        'wordCount': len(text.split()),
        'characterCount': len(text),
        'avgWordLength': sum(len(word) for word in text.split()) / max(1, len(text.split()))
    }
    
    # Adjust sentiment based on rating if available
    if rating is not None:
        # Convert rating to normalized score between -1 and 1
        rating_score = (rating - 3) / 2
        # Blend text sentiment with rating (giving more weight to rating)
        sentiment['adjustedScore'] = basic_score * 0.3 + rating_score * 0.7
        
        # Update label based on adjusted score
        if sentiment['adjustedScore'] > 0.5:
            sentiment['adjustedLabel'] = 'very positive'
        elif sentiment['adjustedScore'] > 0:
            sentiment['adjustedLabel'] = 'positive'
        elif sentiment['adjustedScore'] == 0:
            sentiment['adjustedLabel'] = 'neutral'
        elif sentiment['adjustedScore'] > -0.5:
            sentiment['adjustedLabel'] = 'negative'
        else:
            sentiment['adjustedLabel'] = 'very negative'
    
    return sentiment

def detect_topics(comments):
    """Detect main topics from a list of comments"""
    all_keywords = []
    for comment in comments:
        if 'sentiment' in comment and 'keywords' in comment['sentiment']:
            all_keywords.extend(comment['sentiment']['keywords'])
    
    # Count keyword frequencies
    keyword_counts = Counter(all_keywords)
    
    # Return top keywords
    return keyword_counts.most_common(10)

def calculate_metrics(report):
    """Calculate various metrics from the report data"""
    metrics = {}
    
    # Get all comments
    all_comments = []
    for analysis in report['analyses']:
        all_comments.extend(analysis['comments'])
    
    if not all_comments:
        return {}
    
    # Calculate sentiment metrics
    sentiment_scores = [
        c['sentiment'].get('adjustedScore', c['sentiment']['score']) 
        for c in all_comments
    ]
    
    metrics['sentimentStats'] = {
        'mean': sum(sentiment_scores) / len(sentiment_scores),
        'median': sorted(sentiment_scores)[len(sentiment_scores) // 2],
        'min': min(sentiment_scores),
        'max': max(sentiment_scores),
        'stdDev': math.sqrt(sum((x - (sum(sentiment_scores) / len(sentiment_scores))) ** 2 for x in sentiment_scores) / len(sentiment_scores))
    }
    
    # Calculate rating metrics if available
    ratings = [c['rating'] for c in all_comments if c.get('rating') is not None]
    if ratings:
        metrics['ratingStats'] = {
            'mean': sum(ratings) / len(ratings),
            'median': sorted(ratings)[len(ratings) // 2],
            'min': min(ratings),
            'max': max(ratings),
            'distribution': {i: ratings.count(i) for i in range(1, 6)}
        }
    
    # Calculate temporal metrics
    timestamps = [datetime.fromisoformat(c['createdAt'].replace('Z', '+00:00')) for c in all_comments]
    if timestamps:
        current_time = datetime.now()
        metrics['temporalStats'] = {
            'oldest': min(timestamps).isoformat(),
            'newest': max(timestamps).isoformat(),
            'timespan': (max(timestamps) - min(timestamps)).days,
            'hourDistribution': [0] * 24,
            'dayDistribution': [0] * 7
        }
        
        # Calculate distribution by hour and day
        for ts in timestamps:
            metrics['temporalStats']['hourDistribution'][ts.hour] += 1
            metrics['temporalStats']['dayDistribution'][ts.weekday()] += 1
    
    return metrics

def generate_insights(report):
    """Generate insights from the report data"""
    insights = []
    
    # Get all comments
    all_comments = []
    all_products = set()
    for analysis in report['analyses']:
        all_comments.extend(analysis['comments'])
        for comment in analysis['comments']:
            all_products.add(comment['productId'])
    
    if not all_comments:
        return ["No comments available for analysis yet."]
    
    # Overall sentiment insight
    if report['overallSentiment'] > 0.5:
        insights.append({
            "type": "positive",
            "text": "Overall sentiment is very positive (score: {:.2f}). Customers are extremely satisfied with the products.".format(report['overallSentiment'])
        })
    elif report['overallSentiment'] > 0:
        insights.append({
            "type": "positive",
            "text": "Overall sentiment is positive (score: {:.2f}). Customers are generally satisfied with the products.".format(report['overallSentiment'])
        })
    elif report['overallSentiment'] > -0.5:
        insights.append({
            "type": "warning",
            "text": "Overall sentiment is slightly negative (score: {:.2f}). There may be issues that need attention.".format(report['overallSentiment'])
        })
    else:
        insights.append({
            "type": "negative",
            "text": "Overall sentiment is very negative (score: {:.2f}). Immediate attention to customer concerns is recommended.".format(report['overallSentiment'])
        })
    
    # Identify dominant emotions across all comments
    emotions = {}
    for comment in all_comments:
        if 'sentiment' in comment and 'dominantEmotion' in comment['sentiment']:
            emotion = comment['sentiment']['dominantEmotion']
            if emotion not in emotions:
                emotions[emotion] = 0
            emotions[emotion] += 1
    
    if emotions:
        dominant_emotion = max(emotions.items(), key=lambda x: x[1])
        if dominant_emotion[0] in ['joy', 'satisfaction']:
            insights.append({
                "type": "positive",
                "text": f"The dominant emotion in customer comments is '{dominant_emotion[0]}', appearing in {dominant_emotion[1]} comments."
            })
        elif dominant_emotion[0] in ['anger', 'sadness', 'frustration']:
            insights.append({
                "type": "negative",
                "text": f"The dominant emotion in customer comments is '{dominant_emotion[0]}', appearing in {dominant_emotion[1]} comments. This needs attention."
            })
        else:
            insights.append({
                "type": "info",
                "text": f"The dominant emotion in customer comments is '{dominant_emotion[0]}', appearing in {dominant_emotion[1]} comments."
            })
    
    # Product-specific insights
    for product_id, summary in report['productSummaries'].items():
        # Only include products with at least 2 comments for better statistical relevance
        if summary['totalComments'] >= 2:
            if summary['averageSentiment'] > 0.5:
                insights.append({
                    "type": "positive",
                    "text": f"{summary['productName']} is receiving highly positive feedback (score: {summary['averageSentiment']:.2f})."
                })
            elif summary['averageSentiment'] < -0.3:
                insights.append({
                    "type": "negative",
                    "text": f"{summary['productName']} is receiving negative feedback (score: {summary['averageSentiment']:.2f}). Consider investigating issues."
                })
            
            # Check for sentiment trend
            if 'sentimentTrend' in summary and len(summary['sentimentTrend']) >= 3:
                recent_trend = summary['sentimentTrend'][-3:]
                is_improving = recent_trend[2]['sentiment'] > recent_trend[0]['sentiment']
                is_declining = recent_trend[2]['sentiment'] < recent_trend[0]['sentiment']
                
                if is_improving and abs(recent_trend[2]['sentiment'] - recent_trend[0]['sentiment']) > 0.2:
                    insights.append({
                        "type": "positive",
                        "text": f"{summary['productName']} is showing improved sentiment in recent comments (+{abs(recent_trend[2]['sentiment'] - recent_trend[0]['sentiment']):.2f})."
                    })
                elif is_declining and abs(recent_trend[2]['sentiment'] - recent_trend[0]['sentiment']) > 0.2:
                    insights.append({
                        "type": "negative",
                        "text": f"{summary['productName']} is showing declining sentiment in recent comments (-{abs(recent_trend[2]['sentiment'] - recent_trend[0]['sentiment']):.2f})."
                    })
            
            # Feature feedback insights
            if 'featureFeedback' in summary:
                pos_features = []
                neg_features = []
                
                for feature, data in summary['featureFeedback'].items():
                    if data['score'] > 0.5:
                        pos_features.append(feature)
                    elif data['score'] < -0.3:
                        neg_features.append(feature)
                
                if pos_features:
                    insights.append({
                        "type": "positive",
                        "text": f"{summary['productName']} receives positive feedback for: {', '.join(pos_features)}."
                    })
                if neg_features:
                    insights.append({
                        "type": "warning",
                        "text": f"{summary['productName']} receives negative feedback for: {', '.join(neg_features)}."
                    })
    
    # Compare products if we have multiple with sufficient data
    products_with_data = [p for p in report['productSummaries'].values() if p['totalComments'] >= 2]
    if len(products_with_data) >= 2:
        best_product = max(products_with_data, key=lambda p: p['averageSentiment'])
        worst_product = min(products_with_data, key=lambda p: p['averageSentiment'])
        
        if best_product['averageSentiment'] > 0:
            insights.append({
                "type": "positive",
                "text": f"{best_product['productName']} has the most positive sentiment (score: {best_product['averageSentiment']:.2f}) among all products."
            })
        
        if worst_product['averageSentiment'] < 0:
            insights.append({
                "type": "negative",
                "text": f"{worst_product['productName']} has the most negative sentiment (score: {worst_product['averageSentiment']:.2f}) among all products."
            })
            
        # Calculate sentiment gap between best and worst
        gap = best_product['averageSentiment'] - worst_product['averageSentiment']
        if gap > 1:
            insights.append({
                "type": "warning",
                "text": f"Large sentiment gap ({gap:.2f}) between best and worst performing products."
            })
    
    # Topic analysis
    topics = detect_topics(all_comments)
    if topics:
        topic_text = ", ".join([f"{topic}" for topic, count in topics[:5]])
        insights.append({
            "type": "info",
            "text": f"Top mentioned topics in comments: {topic_text}."
        })
    
    # Time-based insights
    timestamps = [datetime.fromisoformat(c['createdAt'].replace('Z', '+00:00')) for c in all_comments]
    if timestamps:
        now = datetime.now()
        recent_comments = [c for c in all_comments if (now - datetime.fromisoformat(c['createdAt'].replace('Z', '+00:00'))).days <= 1]
        if recent_comments:
            recent_sentiment = sum([c['sentiment'].get('adjustedScore', c['sentiment']['score']) for c in recent_comments]) / len(recent_comments)
            older_comments = [c for c in all_comments if c not in recent_comments]
            if older_comments:
                older_sentiment = sum([c['sentiment'].get('adjustedScore', c['sentiment']['score']) for c in older_comments]) / len(older_comments)
                diff = recent_sentiment - older_sentiment
                if abs(diff) > 0.3:
                    insight_type = "positive" if diff > 0 else "negative"
                    insights.append({
                        "type": insight_type,
                        "text": f"Recent comments (last 24h) show {diff:.2f} {'higher' if diff > 0 else 'lower'} sentiment compared to older comments."
                    })
    
    # Add key improvement recommendations if needed
    if report['overallSentiment'] < 0:
        # Find most common negative aspects
        feature_scores = {}
        for product in report['productSummaries'].values():
            if 'featureFeedback' in product:
                for feature, data in product['featureFeedback'].items():
                    if feature not in feature_scores:
                        feature_scores[feature] = []
                    feature_scores[feature].append(data['score'])
        
        if feature_scores:
            avg_scores = {feature: sum(scores)/len(scores) for feature, scores in feature_scores.items()}
            worst_features = sorted(avg_scores.items(), key=lambda x: x[1])[:2]
            
            if worst_features:
                feature_list = ", ".join([f"{feature}" for feature, score in worst_features])
                insights.append({
                    "type": "action",
                    "text": f"Recommended areas for improvement: {feature_list}."
                })
    
    # Shuffle insights but keep the first overall sentiment insight at top
    first_insight = insights[0]
    remaining_insights = insights[1:]
    random.shuffle(remaining_insights)
    insights = [first_insight] + remaining_insights
    
    return insights

def analyze_comments():
    """Fetch comments and perform sentiment analysis"""
    try:
        # Load today's report (or create new one)
        report = load_today_report()
        
        # Fetch comments from API
        print(f"[{datetime.now().isoformat()}] Fetching comments from API...")
        response = requests.get(API_ENDPOINT)
        if response.status_code != 200:
            raise Exception(f"API responded with status: {response.status_code}")
        
        data = response.json()
        if not data.get('success') or not isinstance(data.get('data'), list):
            raise Exception('Invalid data structure received from API')
        
        comments = data['data']
        timestamp = datetime.now().isoformat()
        
        # Collect IDs of already analyzed comments
        analyzed_comment_ids = set()
        for analysis in report['analyses']:
            for comment in analysis['comments']:
                analyzed_comment_ids.add(comment['commentId'])
        
        # Filter out comments that have already been analyzed
        new_comments = [c for c in comments if c['_id'] not in analyzed_comment_ids]
        
        if len(new_comments) == 0:
            print(f"[{timestamp}] No new comments to analyze")
            return
        
        print(f"[{timestamp}] Analyzing {len(new_comments)} new comments")
        
        # Perform sentiment analysis on each comment
        analyzed_comments = []
        all_keywords = []
        all_emotions = {}
        all_features = {}
        
        for comment in new_comments:
            sentiment = analyze_sentiment(comment['text'], comment.get('rating'))
            
            analyzed_comment = {
                'commentId': comment['_id'],
                'productId': comment['productId'],
                'productName': comment.get('productDetails', {}).get('name', 'Unknown Product'),
                'userName': comment['userName'],
                'text': comment['text'],
                'rating': comment.get('rating'),
                'createdAt': comment['createdAt'],
                'sentiment': sentiment
            }
            analyzed_comments.append(analyzed_comment)
            
            # Collect keywords
            if 'keywords' in sentiment:
                all_keywords.extend(sentiment['keywords'])
            
            # Collect emotions
            if 'emotions' in sentiment:
                for emotion, count in sentiment['emotions'].items():
                    if count > 0:
                        if emotion not in all_emotions:
                            all_emotions[emotion] = 0
                        all_emotions[emotion] += 1
            
            # Collect feature feedback
            if 'featureFeedback' in sentiment:
                for feature, count in sentiment['featureFeedback'].items():
                    if count > 0:
                        if feature not in all_features:
                            all_features[feature] = 0
                        all_features[feature] += 1
            
            # Track comment creation timestamp for volume analysis
            try:
                created_at = datetime.fromisoformat(comment['createdAt'].replace('Z', '+00:00'))
                report['allCommentTimestamps'].append(comment['createdAt'])
                
                # Update hour distribution
                report['commentVolume']['hours'][created_at.hour] += 1
                
                # Update day distribution
                report['commentVolume']['days'][created_at.weekday()] += 1
            except (ValueError, TypeError):
                pass
        
        # Create a new analysis entry
        sentiment_scores = [c['sentiment'].get('adjustedScore', c['sentiment']['score']) for c in analyzed_comments]
        average_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
        
        # Get sentiment distribution
        sentiment_distribution = {
            'veryPositive': len([c for c in analyzed_comments if (c['sentiment'].get('adjustedLabel', c['sentiment']['label'])) == 'very positive']),
            'positive': len([c for c in analyzed_comments if (c['sentiment'].get('adjustedLabel', c['sentiment']['label'])) == 'positive']),
            'neutral': len([c for c in analyzed_comments if (c['sentiment'].get('adjustedLabel', c['sentiment']['label'])) == 'neutral']),
            'negative': len([c for c in analyzed_comments if (c['sentiment'].get('adjustedLabel', c['sentiment']['label'])) == 'negative']),
            'veryNegative': len([c for c in analyzed_comments if (c['sentiment'].get('adjustedLabel', c['sentiment']['label'])) == 'very negative']),
        }
        
        # Track keywords
        keyword_counts = Counter(all_keywords)
        top_keywords = keyword_counts.most_common(20)
        for word, count in top_keywords:
            if word not in report['keywords']:
                report['keywords'][word] = 0
            report['keywords'][word] += count
        
        # Track emotions
        for emotion, count in all_emotions.items():
            if emotion not in report['emotionDistribution']:
                report['emotionDistribution'][emotion] = 0
            report['emotionDistribution'][emotion] += count
        
        # Track feature feedback
        for feature, count in all_features.items():
            if feature not in report['featureFeedback']:
                report['featureFeedback'][feature] = {
                    'mentionCount': 0,
                    'positiveCount': 0,
                    'negativeCount': 0,
                    'score': 0
                }
            
            report['featureFeedback'][feature]['mentionCount'] += count
            
            # Count positive and negative mentions
            for comment in analyzed_comments:
                if 'featureFeedback' in comment['sentiment'] and feature in comment['sentiment']['featureFeedback']:
                    sentiment_score = comment['sentiment'].get('adjustedScore', comment['sentiment']['score'])
                    if sentiment_score > 0:
                        report['featureFeedback'][feature]['positiveCount'] += 1
                    elif sentiment_score < 0:
                        report['featureFeedback'][feature]['negativeCount'] += 1
            
            # Calculate feature sentiment score
            total = report['featureFeedback'][feature]['positiveCount'] + report['featureFeedback'][feature]['negativeCount']
            if total > 0:
                report['featureFeedback'][feature]['score'] = (
                    report['featureFeedback'][feature]['positiveCount'] - 
                    report['featureFeedback'][feature]['negativeCount']
                ) / total
        
        # Create analysis summary
        analysis = {
            'timestamp': timestamp,
            'comments': analyzed_comments,
            'summary': {
                'newCommentsCount': len(analyzed_comments),
                'averageSentiment': average_sentiment,
                'sentimentDistribution': sentiment_distribution,
                'topKeywords': top_keywords[:5]
            }
        }
        
        # Add the analysis to the report
        report['analyses'].append(analysis)
        report['totalComments'] += len(analyzed_comments)
        
        # Update sentiment trend
        report['sentimentTrend']['timestamps'].append(timestamp)
        report['sentimentTrend']['values'].append(average_sentiment)
        
        # Update product summaries
        for comment in analyzed_comments:
            product_id = comment['productId']
            if product_id not in report['productSummaries']:
                report['productSummaries'][product_id] = {
                    'productName': comment['productName'],
                    'totalComments': 0,
                    'averageSentiment': 0,
                    'averageRating': 0,
                    'sentimentTrend': [],
                    'keywords': {},
                    'emotions': {},
                    'featureFeedback': {}
                }
            
            summary = report['productSummaries'][product_id]
            comment_score = comment['sentiment'].get('adjustedScore', comment['sentiment']['score'])
            
            # Update product summary
            previous_total = summary['totalComments']
            summary['totalComments'] += 1
            
            # Update average sentiment
            if previous_total > 0:
                summary['averageSentiment'] = ((summary['averageSentiment'] * previous_total) + comment_score) / summary['totalComments']
            else:
                summary['averageSentiment'] = comment_score
            
            # Update average rating if available
            if comment.get('rating'):
                if previous_total > 0 and 'averageRating' in summary:
                    summary['averageRating'] = ((summary['averageRating'] * previous_total) + comment['rating']) / summary['totalComments']
                else:
                    summary['averageRating'] = comment['rating']
            
            # Track sentiment trend
            summary['sentimentTrend'].append({
                'timestamp': timestamp,
                'sentiment': comment_score
            })
            
            # Track product-specific keywords
            if 'keywords' in comment['sentiment']:
                for keyword in comment['sentiment']['keywords']:
                    if keyword not in summary['keywords']:
                        summary['keywords'][keyword] = 0
                    summary['keywords'][keyword] += 1
            
            # Track product-specific emotions
            if 'emotions' in comment['sentiment']:
                for emotion, count in comment['sentiment']['emotions'].items():
                    if count > 0:
                        if emotion not in summary['emotions']:
                            summary['emotions'][emotion] = 0
                        summary['emotions'][emotion] += count
            
            # Track product-specific feature feedback
            if 'featureFeedback' in comment['sentiment']:
                for feature, count in comment['sentiment']['featureFeedback'].items():
                    if count > 0:
                        if feature not in summary['featureFeedback']:
                            summary['featureFeedback'][feature] = {
                                'mentionCount': 0,
                                'positiveCount': 0,
                                'negativeCount': 0,
                                'score': 0
                            }
                        
                        summary['featureFeedback'][feature]['mentionCount'] += count
                        
                        # Count positive and negative mentions based on sentiment
                        sentiment_score = comment['sentiment'].get('adjustedScore', comment['sentiment']['score'])
                        if sentiment_score > 0:
                            summary['featureFeedback'][feature]['positiveCount'] += 1
                        elif sentiment_score < 0:
                            summary['featureFeedback'][feature]['negativeCount'] += 1
                        
                        # Calculate feature sentiment score
                        pos = summary['featureFeedback'][feature]['positiveCount']
                        neg = summary['featureFeedback'][feature]['negativeCount']
                        total = pos + neg
                        
                        if total > 0:
                            summary['featureFeedback'][feature]['score'] = (pos - neg) / total
        
        # Calculate overall sentiment for the entire report
        all_sentiments = []
        for analysis in report['analyses']:
            for comment in analysis['comments']:
                all_sentiments.append(comment['sentiment'].get('adjustedScore', comment['sentiment']['score']))
        
        if all_sentiments:
            report['overallSentiment'] = sum(all_sentiments) / len(all_sentiments)
        
        # Generate insights
        report['insights'] = generate_insights(report)
        
        # Calculate metrics
        report['metrics'] = calculate_metrics(report)
        
        # Save the updated report
        report_path = os.path.join(REPORT_DIRECTORY, get_report_filename())
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"[{timestamp}] Analysis completed, report saved to {report_path}")
        
        # Generate HTML report
        generate_html_report(report)
        
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] Error during analysis: {str(e)}")
        import traceback
        traceback.print_exc()

def generate_chart(data, chart_type, title):
    """Generate a chart as a base64-encoded PNG image"""
    plt.figure(figsize=(10, 5))
    
    if chart_type == 'line':
        plt.plot(data['x'], data['y'])
        plt.ylim(-1, 1)
    elif chart_type == 'bar':
        plt.bar(data['x'], data['y'])
    elif chart_type == 'pie':
        plt.pie(data['y'], labels=data['x'], autopct='%1.1f%%')
    
    plt.title(title)
    plt.tight_layout()
    
    # Save the plot to a bytes buffer
    buffer = BytesIO()
    plt.savefig(buffer, format='png')
    plt.close()
    
    # Encode the bytes to base64
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def generate_html_report(report):
    """Generate an HTML report from the analysis data"""
    # Prepare sentiment trend data
    sentiment_trend_data = {
        'x': report['sentimentTrend']['timestamps'],
        'y': report['sentimentTrend']['values']
    }
    sentiment_trend_chart = generate_chart(sentiment_trend_data, 'line', 'Sentiment Trend Over Time')
    
    # Prepare emotion distribution data
    emotion_data = {
        'x': list(report['emotionDistribution'].keys()),
        'y': list(report['emotionDistribution'].values())
    }
    emotion_chart = generate_chart(emotion_data, 'pie', 'Emotion Distribution')
    
    # Prepare feature feedback data
    feature_data = {
        'x': list(report['featureFeedback'].keys()),
        'y': [report['featureFeedback'][f]['score'] for f in report['featureFeedback']]
    }
    feature_chart = generate_chart(feature_data, 'bar', 'Feature Feedback Scores')
    
    # Prepare comment volume by hour
    hour_volume_data = {
        'x': list(range(24)),
        'y': report['commentVolume']['hours']
    }
    hour_chart = generate_chart(hour_volume_data, 'bar', 'Comment Volume by Hour')
    
    # Prepare comment volume by day
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    day_volume_data = {
        'x': days,
        'y': report['commentVolume']['days']
    }
    day_chart = generate_chart(day_volume_data, 'bar', 'Comment Volume by Day')
    
    # Generate the HTML report using a template
    html_template = """<!DOCTYPE html>
    <html>
    <head>
        <title>Sentiment Analysis Report - {{ report.date }}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #4a69bd;
                color: white;
                padding: 20px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .card {
                background-color: white;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                margin-bottom: 20px;
                padding: 20px;
            }
            .chart {
                width: 100%;
                margin-top: 10px;
            }
            .metrics {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
            }
            .metric {
                flex: 0 0 23%;
                background-color: #f1f2f6;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 15px;
                text-align: center;
            }
            .metric h3 {
                font-size: 14px;
                margin: 0;
                color: #2f3542;
            }
            .metric p {
                font-size: 28px;
                font-weight: bold;
                margin: 10px 0 0 0;
                color: #4a69bd;
            }
            .insights {
                margin-top: 20px;
            }
            .insight {
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 5px;
            }
            .positive {
                background-color: #d4ffd4;
                border-left: 5px solid #26de81;
            }
            .negative {
                background-color: #ffe0e0;
                border-left: 5px solid #fc5c65;
            }
            .warning {
                background-color: #fff4d4;
                border-left: 5px solid #fed330;
            }
            .info {
                background-color: #e0f0ff;
                border-left: 5px solid #45aaf2;
            }
            .action {
                background-color: #e0e0ff;
                border-left: 5px solid #4b7bec;
            }
            .comments {
                margin-top: 20px;
            }
            .comment {
                padding: 15px;
                border-bottom: 1px solid #eee;
            }
            .sentiment-positive {
                color: #26de81;
            }
            .sentiment-negative {
                color: #fc5c65;
            }
            .sentiment-neutral {
                color: #a5b1c2;
            }
            .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            @media (max-width: 768px) {
                .grid {
                    grid-template-columns: 1fr;
                }
                .metric {
                    flex: 0 0 48%;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Sentiment Analysis Report</h1>
                <p>{{ report.date }} | {{ report.totalComments }} total comments</p>
            </div>
            
            <div class="card">
                <h2>Overall Sentiment: {{ "%.2f"|format(report.overallSentiment|float) }}</h2>
                <div class="metrics">
                    <div class="metric">
                        <h3>Total Comments</h3>
                        <p>{{ report.totalComments }}</p>
                    </div>
                    <div class="metric">
                        <h3>Products</h3>
                        <p>{{ report.productSummaries|length }}</p>
                    </div>
                    <div class="metric">
                        <h3>Positive Comments</h3>
                        <p>{{ positive_count }}</p>
                    </div>
                    <div class="metric">
                        <h3>Negative Comments</h3>
                        <p>{{ negative_count }}</p>
                    </div>
                </div>
                
                <div class="chart">
                    <h3>Sentiment Trend</h3>
                    <img src="{{ sentiment_trend_chart }}" alt="Sentiment Trend" style="max-width: 100%;">
                </div>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h2>Emotions</h2>
                    <img src="{{ emotion_chart }}" alt="Emotion Distribution" style="max-width: 100%;">
                </div>
                
                <div class="card">
                    <h2>Feature Feedback</h2>
                    <img src="{{ feature_chart }}" alt="Feature Feedback" style="max-width: 100%;">
                </div>
            </div>
            
            <div class="grid">
                <div class="card">
                    <h2>Comment Volume by Hour</h2>
                    <img src="{{ hour_chart }}" alt="Comment Volume by Hour" style="max-width: 100%;">
                </div>
                
                <div class="card">
                    <h2>Comment Volume by Day</h2>
                    <img src="{{ day_chart }}" alt="Comment Volume by Day" style="max-width: 100%;">
                </div>
            </div>
            
            <div class="card insights">
                <h2>Key Insights</h2>
                {% for insight in report.insights %}
                <div class="insight {{ insight.type }}">
                    {{ insight.text }}
                </div>
                {% endfor %}
            </div>
            
            <div class="card">
                <h2>Product Summaries</h2>
                {% for product_id, product in report.productSummaries.items() %}
                <div class="card">
                    <h3>{{ product.productName }}</h3>
                    <div class="metrics">
                        <div class="metric">
                            <h3>Comments</h3>
                            <p>{{ product.totalComments }}</p>
                        </div>
                        <div class="metric">
                            <h3>Sentiment</h3>
                            <p class="{{ 'sentiment-positive' if product.averageSentiment > 0 else 'sentiment-negative' if product.averageSentiment < 0 else 'sentiment-neutral' }}">
                                {{ "%.2f"|format(product.averageSentiment|float) }}
                            </p>
                        </div>
                        {% if product.averageRating %}
                        <div class="metric">
                            <h3>Rating</h3>
                            <p>{{ "%.1f"|format(product.averageRating|float) }}/5</p>
                        </div>
                        {% endif %}
                    </div>
                    
                    <div>
                        <h4>Top Keywords</h4>
                        <p>
                            {% if product.keywords %}
                            {{ ", ".join(product.keywords.keys()[:5]) }}
                            {% else %}
                            No keywords available
                            {% endif %}
                        </p>
                    </div>
                    
                    <div>
                        <h4>Dominant Emotions</h4>
                        <p>
                            {% if product.emotions %}
                            {{ ", ".join(product.emotions.keys()[:3]) }}
                            {% else %}
                            No emotion data available
                            {% endif %}
                        </p>
                    </div>
                </div>
                {% endfor %}
            </div>
            
            <div class="card comments">
                <h2>Recent Comments (Last 10)</h2>
                {% for analysis in report.analyses|reverse %}
                {% for comment in analysis.comments|reverse %}
                {% if loop.index <= 10 %}
                <div class="comment">
                    <h4>{{ comment.productName }} | {{ comment.userName }}</h4>
                    <p>{{ comment.text }}</p>
                    <p class="{{ 'sentiment-positive' if comment.sentiment.score > 0 else 'sentiment-negative' if comment.sentiment.score < 0 else 'sentiment-neutral' }}">
                        Sentiment: {{ comment.sentiment.label }} ({{ "%.2f"|format(comment.sentiment.score|float) }})
                        {% if comment.sentiment.dominantEmotion %}
                        | Emotion: {{ comment.sentiment.dominantEmotion }}
                        {% endif %}
                    </p>
                </div>
                {% endif %}
                {% endfor %}
                {% endfor %}
            </div>
            
            <div class="card">
                <h2>Report Details</h2>
                <p>Generated: {{ timestamp }}</p>
                <p>Data period: {{ oldest_comment }} to {{ newest_comment }}</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Calculate positive and negative comment counts
    positive_count = 0
    negative_count = 0
    oldest_comment = None
    newest_comment = None
    
    # Process timestamps for the report
    if report['allCommentTimestamps']:
        timestamp_objects = [datetime.fromisoformat(ts.replace('Z', '+00:00')) for ts in report['allCommentTimestamps']]
        oldest_comment = min(timestamp_objects).strftime('%Y-%m-%d')
        newest_comment = max(timestamp_objects).strftime('%Y-%m-%d')
    else:
        oldest_comment = report['date']
        newest_comment = report['date']
    
    # Count positive and negative comments
    for analysis in report['analyses']:
        for comment in analysis['comments']:
            sentiment = comment['sentiment'].get('adjustedScore', comment['sentiment']['score'])
            if sentiment > 0:
                positive_count += 1
            elif sentiment < 0:
                negative_count += 1
    
    # Render the template
    template = Template(html_template)
    html_content = template.render(
        report=report,
        positive_count=positive_count,
        negative_count=negative_count,
        sentiment_trend_chart=sentiment_trend_chart,
        emotion_chart=emotion_chart,
        feature_chart=feature_chart,
        hour_chart=hour_chart,
        day_chart=day_chart,
        timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        oldest_comment=oldest_comment,
        newest_comment=newest_comment
    )
    
    # Save the HTML report
    html_path = os.path.join(REPORT_DIRECTORY, f"sentiment_report_{report['date']}.html")
    with open(html_path, 'w') as f:
        f.write(html_content)
    
    print(f"[{datetime.now().isoformat()}] HTML report generated at {html_path}")

def run_analysis_job():
    """Run the analysis job"""
    print(f"[{datetime.now().isoformat()}] Running scheduled sentiment analysis job")
    analyze_comments()

# Schedule the analysis job to run every hour
def schedule_jobs():
    """Schedule analysis jobs"""
    schedule.every(1).hour.do(run_analysis_job)
    print(f"[{datetime.now().isoformat()}] Scheduled sentiment analysis job to run every hour")
    
    # Run immediately on startup
    run_analysis_job()
    
    # Keep the scheduler running
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    schedule_jobs()