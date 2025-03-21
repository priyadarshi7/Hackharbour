import pandas as pd
import numpy as np
import nltk
import spacy
import re
import json
import os
from datetime import datetime
from collections import Counter, defaultdict
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import NMF, LatentDirichletAllocation
from textblob import TextBlob
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud
from gensim import corpora
from gensim.models import LdaModel, CoherenceModel
import torch
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
from scipy import stats
import networkx as nx

# Download required NLTK resources
nltk.download('vader_lexicon', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Configuration
API_ENDPOINT = 'http://localhost:4000/api/comment/all-with-products'
REPORT_DIRECTORY = './reports'
SENTIMENT_ANALYZER = SentimentIntensityAnalyzer()
STOP_WORDS = set(stopwords.words('english'))
LEMMATIZER = WordNetLemmatizer()

# Set up transformer models if available
device = 0 if torch.cuda.is_available() else -1
try:
    # Modern transformer model for sentiment
    sentiment_model_name = "distilroberta-base-sentiment-analysis"
    sentiment_classifier = pipeline(
        "sentiment-analysis", 
        model=sentiment_model_name, 
        device=device
    )
    
    # Modern emotion model
    emotion_model_name = "SamLowe/roberta-base-go-emotions"
    emotion_classifier = pipeline(
        "text-classification",
        model=emotion_model_name,
        top_k=5,
        device=device
    )
    
    # Zero-shot classification for product features
    zeroshot_classifier = pipeline(
        "zero-shot-classification",
        model="facebook/bart-large-mnli",
        device=device
    )
    
    # Context-aware text generation for insight synthesis
    summarizer = pipeline(
        "summarization",
        model="facebook/bart-large-cnn", 
        device=device
    )
    
    has_advanced_models = True
except Exception as e:
    print(f"Advanced models unavailable: {str(e)}")
    has_advanced_models = False
    sentiment_classifier = None
    emotion_classifier = None
    zeroshot_classifier = None
    summarizer = None

# Product-specific vocabulary
PRODUCT_FEATURES = {
    # To be populated dynamically from comments
    "features": set(),
    "benefits": set(),
    "issues": set()
}

# Enhanced emotion categories
EMOTION_CATEGORIES = {
    'positive': ['joy', 'amusement', 'approval', 'excitement', 'gratitude', 'love', 'optimism', 'relief', 'pride', 'admiration', 'desire', 'caring'],
    'negative': ['anger', 'annoyance', 'disapproval', 'disgust', 'sadness', 'disappointment', 'embarrassment', 'grief', 'remorse', 'fear', 'nervousness'],
    'neutral': ['surprise', 'realization', 'curiosity', 'confusion', 'neutral']
}

# Inverse emotion mapping
EMOTION_MAP = {}
for category, emotions in EMOTION_CATEGORIES.items():
    for emotion in emotions:
        EMOTION_MAP[emotion] = category

# Ensure reports directory exists
if not os.path.exists(REPORT_DIRECTORY):
    os.makedirs(REPORT_DIRECTORY, exist_ok=True)

class EnhancedSentimentAnalyzer:
    def __init__(self, comments=None):
        self.comments = comments or []
        self.report = self._init_report()
        self.product_dictionary = self._build_product_dictionary()
    
    def _init_report(self):
        """Initialize the report structure"""
        return {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'analyses': [],
            'productSummaries': {},
            'overallSentiment': None,
            'sentimentDistribution': {},
            'totalComments': 0,
            'insights': [],
            'criticalities': [],
            'topicAnalysis': {},
            'featureAnalysis': {},
            'competitiveAnalysis': {},
            'userSegmentation': {},
            'trendsOverTime': {},
            'productComparisons': {},
            'keyPhrases': {},
            'sentimentDrivers': {},
            'recommendationNetwork': {},
            'anomalies': []
        }
    
    def _build_product_dictionary(self):
        """Build product-specific vocabulary from comments"""
        if not self.comments:
            return {}
            
        # Extract all product names
        products = {}
        for comment in self.comments:
            product_id = comment.get('productId')
            if product_id and product_id not in products:
                products[product_id] = {
                    'name': comment.get('productName', ''),
                    'features': set(),
                    'vocabulary': set(),
                    'comments': []
                }
            
            if product_id:
                products[product_id]['comments'].append(comment)
                
        # Process comments for each product to extract vocabulary
        for product_id, product_data in products.items():
            all_text = ' '.join([c['text'] for c in product_data['comments']])
            doc = nlp(all_text)
            
            # Extract noun phrases as potential features
            for chunk in doc.noun_chunks:
                if len(chunk.text.split()) <= 3:  # Limit to short phrases
                    product_data['vocabulary'].add(chunk.text.lower())
                    
                    # Identify likely product features using dependency parsing
                    for token in chunk:
                        if token.dep_ in ('nsubj', 'dobj') and token.pos_ in ('NOUN', 'PROPN'):
                            product_data['features'].add(token.lemma_.lower())
            
            # Use transformers for feature extraction if available
            if has_advanced_models and zeroshot_classifier and len(product_data['comments']) > 5:
                # Generate candidate features from comments
                sample_texts = [c['text'] for c in product_data['comments'][:10]]
                candidate_features = list(product_data['vocabulary'])[:30]
                
                for text in sample_texts:
                    if len(text) > 20:
                        try:
                            result = zeroshot_classifier(text, candidate_features, multi_label=True)
                            for label, score in zip(result['labels'], result['scores']):
                                if score > 0.7:  # High confidence
                                    product_data['features'].add(label.lower())
                        except:
                            pass
        
        return products
    
    def preprocess_text(self, text):
        """Clean and preprocess text for analysis"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+', '', text)
        
        # Remove special characters (keep apostrophes for contractions)
        text = re.sub(r'[^a-zA-Z\']', ' ', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords and lemmatize
        cleaned_tokens = [LEMMATIZER.lemmatize(token) for token in tokens 
                         if token not in STOP_WORDS and len(token) > 2]
        
        return ' '.join(cleaned_tokens), cleaned_tokens, tokens
    
    def analyze_comment(self, comment):
        """Perform enhanced sentiment analysis on a single comment"""
        text = comment.get('text', '')
        rating = comment.get('rating')
        product_id = comment.get('productId')
        
        # Skip empty comments
        if not text.strip():
            return comment
        
        # Preprocess text
        processed_text, cleaned_tokens, raw_tokens = self.preprocess_text(text)
        
        # Sentiment analysis with multiple models
        vader_scores = SENTIMENT_ANALYZER.polarity_scores(text)
        
        # TextBlob analysis
        blob = TextBlob(text)
        textblob_polarity = blob.sentiment.polarity
        textblob_subjectivity = blob.sentiment.subjectivity
        
        # Transformer sentiment if available
        transformer_score = None
        if has_advanced_models and sentiment_classifier:
            try:
                result = sentiment_classifier(text[:512])[0]
                if result['label'] == 'POSITIVE':
                    transformer_score = result['score']
                elif result['label'] == 'NEGATIVE':
                    transformer_score = -result['score']
                else:
                    transformer_score = 0
            except Exception as e:
                print(f"Error in transformer sentiment: {str(e)}")
        
        # Combine sentiment models
        if transformer_score is not None:
            combined_score = (
                vader_scores['compound'] * 0.25 + 
                textblob_polarity * 0.15 + 
                transformer_score * 0.6
            )
        else:
            combined_score = (
                vader_scores['compound'] * 0.6 + 
                textblob_polarity * 0.4
            )
        
        # Advanced emotion detection
        emotions = {}
        if has_advanced_models and emotion_classifier:
            try:
                results = emotion_classifier(text[:512])
                for result in results:
                    emotion = result['label']
                    score = result['score']
                    category = EMOTION_MAP.get(emotion, 'neutral')
                    
                    if category not in emotions or score > emotions[category]:
                        emotions[category] = score
            except:
                # Fallback to keyword-based
                pass
        
        # Keyword emotion detection as fallback
        if not emotions:
            emotion_keywords = {
                'positive': ['amazing', 'awesome', 'excellent', 'love', 'great', 'nice', 'happy', 'pleased'],
                'negative': ['terrible', 'awful', 'horrible', 'hate', 'bad', 'angry', 'upset', 'disappointed'],
                'neutral': ['okay', 'fine', 'alright', 'neutral', 'standard']
            }
            
            for category, keywords in emotion_keywords.items():
                for token in raw_tokens:
                    if token.lower() in keywords:
                        emotions[category] = emotions.get(category, 0) + 0.1
        
        # Ensure we have at least one emotion
        if not emotions:
            if combined_score > 0.3:
                emotions['positive'] = 0.7
            elif combined_score < -0.3:
                emotions['negative'] = 0.7
            else:
                emotions['neutral'] = 0.7
        
        # Dominant emotion
        dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0] if emotions else 'neutral'
        
        # Set sentiment label
        if combined_score > 0.6:
            sentiment_label = 'very_positive'
        elif combined_score > 0.2:
            sentiment_label = 'positive'
        elif combined_score > -0.2:
            sentiment_label = 'neutral'
        elif combined_score > -0.6:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'very_negative'
        
        # Feature-specific sentiment (aspect-based)
        features = {}
        doc = nlp(text)
        
        # Extract potential product features from this specific comment
        local_features = set()
        for chunk in doc.noun_chunks:
            local_features.add(chunk.root.lemma_.lower())
        
        # Add product-specific features if available
        if product_id and product_id in self.product_dictionary:
            local_features.update(self.product_dictionary[product_id]['features'])
        
        # Analyze sentiment for each feature
        for sentence in doc.sents:
            sentence_text = sentence.text.lower()
            sentence_sentiment = TextBlob(sentence_text).sentiment.polarity
            
            for feature in local_features:
                if feature in sentence_text:
                    # Find adjectives near the feature
                    adjectives = []
                    for token in sentence:
                        if token.pos_ == 'ADJ' and token.text.lower() != feature:
                            adjectives.append(token.text.lower())
                    
                    # Store feature sentiment
                    if feature not in features:
                        features[feature] = {
                            'mentions': 0,
                            'sentiment': 0,
                            'adjectives': []
                        }
                    
                    features[feature]['mentions'] += 1
                    features[feature]['sentiment'] += sentence_sentiment
                    features[feature]['adjectives'].extend(adjectives)
        
        # Normalize feature sentiments
        for feature, data in features.items():
            if data['mentions'] > 0:
                data['sentiment'] /= data['mentions']
        
        # Extract key phrases
        key_phrases = []
        for sentence in doc.sents:
            # Look for sentences with strong sentiment
            sentence_text = sentence.text
            sentence_sentiment = TextBlob(sentence_text).sentiment.polarity
            
            if abs(sentence_sentiment) > 0.4 and len(sentence_text.split()) > 3:
                key_phrases.append({
                    'text': sentence_text,
                    'sentiment': sentence_sentiment
                })
        
        # Extract entities
        entities = {}
        for ent in doc.ents:
            if ent.label_ not in entities:
                entities[ent.label_] = []
            
            entities[ent.label_].append(ent.text)
        
        # Detect intent
        intent = self._detect_intent(text, doc, rating)
        
        # Check for competitor mentions
        competitors = self._detect_competitors(text, doc)
        
        # Criticality assessment
        criticality = self._assess_criticality(text, combined_score, intent, rating)
        
        # Build final sentiment object
        sentiment = {
            'score': combined_score,
            'label': sentiment_label,
            'vaderScores': vader_scores,
            'textblob': {
                'polarity': textblob_polarity,
                'subjectivity': textblob_subjectivity
            },
            'emotions': emotions,
            'dominantEmotion': dominant_emotion,
            'features': features,
            'entities': entities,
            'intent': intent,
            'keyPhrases': key_phrases,
            'competitors': competitors,
            'criticality': criticality
        }
        
        # Adjust with rating if available
        if rating is not None:
            # Convert rating to -1 to 1 scale
            rating_score = (rating - 3) / 2
            
            # Blend rating and text sentiment
            sentiment['adjustedScore'] = combined_score * 0.3 + rating_score * 0.7
            
            # Update label based on adjusted score
            if sentiment['adjustedScore'] > 0.6:
                sentiment['adjustedLabel'] = 'very_positive'
            elif sentiment['adjustedScore'] > 0.2:
                sentiment['adjustedLabel'] = 'positive'
            elif sentiment['adjustedScore'] > -0.2:
                sentiment['adjustedLabel'] = 'neutral'
            elif sentiment['adjustedScore'] > -0.6:
                sentiment['adjustedLabel'] = 'negative'
            else:
                sentiment['adjustedLabel'] = 'very_negative'
        
        # Add sentiment to comment
        comment['sentiment'] = sentiment
        return comment
    
    def _detect_intent(self, text, doc, rating=None):
        """Detect user intent in the comment with NLP"""
        intents = {
            'complaint': 0,
            'suggestion': 0,
            'praise': 0,
            'question': 0,
            'comparison': 0,
            'feature_request': 0,
            'bug_report': 0
        }
        
        # Check for question marks
        if '?' in text:
            intents['question'] += 1.5
        
        # Check sentence structure for questions
        for token in doc:
            if token.pos_ == "VERB" and token.tag_ in ["VBP", "VBZ"] and token.i == 0:
                intents['question'] += 1  # Verb at beginning often indicates question
        
        # Look for comparative language
        for token in doc:
            if token.tag_ in ["JJR", "RBR"]:  # Comparative adjectives/adverbs
                intents['comparison'] += 1
        
        # Feature requests and suggestions
        if re.search(r'(could|should|would|wish|hope|add|improve|implement|include|consider)', text, re.I):
            intents['suggestion'] += 1
            
            if re.search(r'(add|new|feature|functionality|ability to|option to)', text, re.I):
                intents['feature_request'] += 1.5
        
        # Bug reports
        if re.search(r'(bug|issue|problem|error|crash|freeze|not working|doesn\'t work|broken)', text, re.I):
            intents['bug_report'] += 1.5
            intents['complaint'] += 1
        
        # Praise
        if re.search(r'(great|excellent|amazing|love|perfect|awesome|fantastic|best|good|nice)', text, re.I):
            intents['praise'] += 1.5
        
        # Rating-based adjustments
        if rating is not None:
            if rating <= 2:
                intents['complaint'] += 1.5
            elif rating >= 4:
                intents['praise'] += 1
        
        # Get primary intent
        primary_intent = max(intents.items(), key=lambda x: x[1])[0]
        if intents[primary_intent] > 0:
            return primary_intent
        
        return 'general_feedback'
    
    def _detect_competitors(self, text, doc):
        """Detect competitor mentions with context"""
        # This should be customized with actual competitor names
        competitor_keywords = [
            'competitor', 'alternative', 'instead', 'switched from', 
            'better than', 'compared to', 'vs', 'versus', 'unlike',
            'other product', 'similar product'
        ]
        
        competitors = []
        text_lower = text.lower()
        
        # Check for competitor keywords
        for keyword in competitor_keywords:
            if keyword in text_lower:
                # Get the surrounding context
                matches = re.finditer(re.escape(keyword), text_lower)
                for match in matches:
                    start = max(0, match.start() - 30)
                    end = min(len(text_lower), match.end() + 30)
                    context = text_lower[start:end]
                    
                    competitors.append({
                        'keyword': keyword,
                        'context': context
                    })
        
        # Extract organization entities as potential competitors
        for ent in doc.ents:
            if ent.label_ == 'ORG' and ent.text.lower() not in text_lower:
                competitors.append({
                    'keyword': ent.text,
                    'type': 'organization'
                })
        
        return competitors if competitors else None
    
    def _assess_criticality(self, text, sentiment_score, intent, rating=None):
        """Assess the criticality/urgency of a comment"""
        criticality_score = 0
        
        # Very negative sentiment increases criticality
        if sentiment_score < -0.7:
            criticality_score += 2
        elif sentiment_score < -0.4:
            criticality_score += 1
        
        # Bug reports and complaints are more critical
        if intent == 'bug_report':
            criticality_score += 2
        elif intent == 'complaint':
            criticality_score += 1
        
        # Check for urgent language
        urgent_terms = ['urgent', 'immediately', 'critical', 'serious', 'important', 
                       'broken', 'unusable', 'emergency', 'fix', 'asap', 'now']
        
        for term in urgent_terms:
            if term in text.lower():
                criticality_score += 1
                break
        
        # Low rating increases criticality
        if rating is not None and rating <= 1:
            criticality_score += 1
        
        # Determine criticality level
        if criticality_score >= 4:
            return 'critical'
        elif criticality_score >= 2:
            return 'high'
        elif criticality_score >= 1:
            return 'medium'
        else:
            return 'low'
    
    def analyze_all_comments(self):
        """Process all comments with sentiment analysis"""
        for i, comment in enumerate(self.comments):
            analyzed_comment = self.analyze_comment(comment)
            self.report['analyses'].append(analyzed_comment)
        
        self.report['totalComments'] = len(self.report['analyses'])
        return self.report['analyses']
    
    def generate_product_summaries(self):
        """Generate summaries for each product"""
        # Group comments by product
        product_comments = {}
        for comment in self.report['analyses']:
            product_id = comment.get('productId')
            if not product_id:
                continue
                
            if product_id not in product_comments:
                product_comments[product_id] = {
                    'productId': product_id,
                    'productName': comment.get('productName', ''),
                    'comments': []
                }
            
            product_comments[product_id]['comments'].append(comment)
        
        # Generate summary for each product
        product_summaries = {}
        for product_id, data in product_comments.items():
            # Skip products with too few comments
            if len(data['comments']) < 3:
                continue
                
            # Calculate sentiment stats
            sentiments = [c['sentiment']['score'] for c in data['comments']]
            avg_sentiment = sum(sentiments) / len(sentiments)
            
            # Count sentiment categories
            sentiment_counts = Counter([c['sentiment']['label'] for c in data['comments']])
            
            # Get emotion distribution
            emotions = Counter()
            for comment in data['comments']:
                dominant = comment['sentiment']['dominantEmotion']
                if dominant:
                    emotions[dominant] += 1
            
            # Extract common intents
            intents = Counter([c['sentiment']['intent'] for c in data['comments']])
            
            # Extract top features
            feature_mentions = {}
            for comment in data['comments']:
                for feature, feature_data in comment['sentiment'].get('features', {}).items():
                    if feature not in feature_mentions:
                        feature_mentions[feature] = {
                            'mentions': 0,
                            'sentiment': 0,
                            'adjectives': []
                        }
                    
                    feature_mentions[feature]['mentions'] += feature_data['mentions']
                    feature_mentions[feature]['sentiment'] += feature_data['sentiment'] * feature_data['mentions']
                    feature_mentions[feature]['adjectives'].extend(feature_data['adjectives'])
            
            # Normalize feature sentiments and sort by mentions
            top_features = []
            for feature, feature_data in feature_mentions.items():
                if feature_data['mentions'] > 0:
                    feature_data['sentiment'] /= feature_data['mentions']
                    feature_data['adjectives'] = Counter(feature_data['adjectives']).most_common(5)
                    top_features.append((feature, feature_data))
            
            top_features.sort(key=lambda x: x[1]['mentions'], reverse=True)
            
            # Extract top phrases
            key_phrases = []
            for comment in data['comments']:
                for phrase in comment['sentiment'].get('keyPhrases', []):
                    key_phrases.append(phrase)
            
            # Sort by sentiment intensity (positive and negative)
            key_phrases.sort(key=lambda x: abs(x['sentiment']), reverse=True)
            
            # Criticality assessment
            criticality_counts = Counter([c['sentiment'].get('criticality', 'low') for c in data['comments']])
            
            # Build product summary
            product_summaries[product_id] = {
                'productId': product_id,
                'productName': data['productName'],
                'commentCount': len(data['comments']),
                'avgSentiment': avg_sentiment,
                'sentimentDistribution': dict(sentiment_counts),
                'emotionDistribution': dict(emotions),
                'topIntents': intents.most_common(3),
                'topFeatures': dict(top_features[:10]),
                'keyPhrases': key_phrases[:5],
                'criticalityDistribution': dict(criticality_counts)
            }
            
            # Generate concise summary text if transformer available
            if has_advanced_models and summarizer:
                try:
                    # Concatenate top comments for summarization
                    top_comments = sorted(
                        data['comments'], 
                        key=lambda x: abs(x['sentiment']['score']), 
                        reverse=True
                    )[:5]
                    
                    text_to_summarize = " ".join([c['text'] for c in top_comments])
                    if len(text_to_summarize) > 50:
                        summary = summarizer(
                            text_to_summarize, 
                            max_length=100, 
                            min_length=30, 
                            do_sample=False
                        )[0]['summary_text']
                        
                        product_summaries[product_id]['summary'] = summary
                except Exception as e:
                    print(f"Summarization error: {str(e)}")
        
        self.report['productSummaries'] = product_summaries
        return product_summaries
    
    def identify_sentiment_drivers(self):
        """Identify key drivers of positive and negative sentiment"""
        # Collect all feature sentiments
        features = {}
        for comment in self.report['analyses']:
            for feature, data in comment['sentiment'].get('features', {}).items():
                if feature not in features:
                    features[feature] = {
                        'mentions': 0,
                        'positive': 0,
                        'negative': 0,
                        'neutral': 0,
                        'total_sentiment': 0,
                        'comments': []
                    }
                
                features[feature]['mentions'] += data['mentions']
                features[feature]['total_sentiment'] += data['sentiment'] * data['mentions']
                
                # Count sentiment polarities
                if data['sentiment'] > 0.2:
                    features[feature]['positive'] += data['mentions']
                elif data['sentiment'] < -0.2:
                    features[feature]['negative'] += data['mentions']
                else:
                    features[feature]['neutral'] += data['mentions']
                
                # Store comment reference
                features[feature]['comments'].append({
                    'commentId': comment.get('commentId'),
                    'text': comment.get('text'),
                    'sentiment': data['sentiment']
                })
        
        # Calculate impact scores
        drivers = {
            'positive': [],
            'negative': [],
            'mixed': [],
            'neutral': []
        }
        
        for feature, data in features.items():
            if data['mentions'] < 2:
                continue
                
            # Calculate average sentiment
            avg_sentiment = data['total_sentiment'] / data['mentions']
            
            # Calculate impact based on mention count and sentiment strength
            impact = data['mentions'] * abs(avg_sentiment)
            
            # Categorize drivers
            if avg_sentiment > 0.4:
                drivers['positive'].append({
                    'feature': feature,
                    'mentions': data['mentions'],
                    'avgSentiment': avg_sentiment,
                    'impact': impact,
                    'positive': data['positive'],
                    'negative': data['negative'],
                    'examples': sorted(data['comments'], key=lambda x: x['sentiment'], reverse=True)[:2]
                })
            elif avg_sentiment < -0.4:
                drivers['negative'].append({
                    'feature': feature,
                    'mentions': data['mentions'],
                    'avgSentiment': avg_sentiment,
                    'impact': impact,
                    'positive': data['positive'],
                    'negative': data['negative'],
                    'examples': sorted(data['comments'], key=lambda x: x['sentiment'])[:2]
                })
            elif abs(avg_sentiment) <= 0.2:
                drivers['neutral'].append({
                    'feature': feature,
                    'mentions': data['mentions'],
                    'avgSentiment': avg_sentiment,
                    'impact': impact,
                    'positive': data['positive'],
                    'negative': data['negative']
                })
            else:
                # Mixed sentiment cases
                if data['positive'] > 0 and data['negative'] > 0:
                    drivers['mixed'].append({
                        'feature': feature,
                        'mentions': data['mentions'],
                        'avgSentiment': avg_sentiment,
                        'impact': impact,
                        'positive': data['positive'],
                        'negative': data['negative'],
                        'positiveExample': sorted(data['comments'], key=lambda x: x['sentiment'], reverse=True)[0] if data['comments'] else None,
                        'negativeExample': sorted(data['comments'], key=lambda x: x['sentiment'])[0] if data['comments'] else None
                    })
        
        # Sort by impact
        for category in drivers:
            drivers[category].sort(key=lambda x: x['impact'], reverse=True)
        
        self.report['sentimentDrivers'] = drivers
        return drivers
    
    def perform_topic_modeling(self, num_topics=5):
        """Extract topics from comments using advanced NLP"""
        if len(self.report['analyses']) < 10:
            return None  # Not enough data
        
        # Prepare data
        texts = []
        sentiments = []
        comment_indices = []
        
        for i, comment in enumerate(self.report['analyses']):
            # Get preprocessed text
            processed_text, _, _ = self.preprocess_text(comment['text'])
            texts.append(processed_text)
            sentiments.append(comment['sentiment']['score'])
            comment_indices.append(i)
        
        # Create TF-IDF matrix
        vectorizer = TfidfVectorizer(max_features=500, min_df=2)
        tfidf_matrix = vectorizer.fit_transform(texts)
        
        # Use Non-Negative Matrix Factorization for topic modeling
        nmf_model = NMF(n_components=num_topics, random_state=42)
        nmf_topics = nmf_model.fit_transform(tfidf_matrix)
        
        # Get feature names
        feature_names = vectorizer.get_feature_names_out()
        
        # Extract topics
        topics = []
        for topic_idx, topic in enumerate(nmf_model.components_):
            top_terms_idx = topic.argsort()[:-11:-1]
            top_terms = [feature_names[i] for i in top_terms_idx]
            
            # Find representative comments
            topic_comments = []
            for comment_idx, comment_topics in enumerate(nmf_topics):
                if comment_topics[topic_idx] > 0.3:  # Strong topic association
                    topic_comments.append({
                        'commentId': self.report['analyses'][comment_indices[comment_idx]].get('commentId'),
                        'text': self.report['analyses'][comment_indices[comment_idx]].get('text'),
                        'score': comment_topics[topic_idx]
                    })
            
            # Sort by topic relevance
            topic_comments.sort(key=lambda x: x['score'], reverse=True)
            
            # Calculate sentiment for this topic
            topic_sentiment = 0
            if topic_comments:
                topic_sentiment_scores = [sentiments[comment_indices.index(i)] for i, c in enumerate(self.report['analyses']) 
                                         if c.get('commentId') in [tc['commentId'] for tc in topic_comments]]
                if topic_sentiment_scores:
                    topic_sentiment = sum(topic_sentiment_scores) / len(topic_sentiment_scores)
            
            topics.append({
                'id': topic_idx,
                'terms': top_terms,
                'sentiment': topic_sentiment,
                'comments': topic_comments[:3]  # Top 3 representative comments
            })
        
        # Try to generate topic labels if transformer models available
        if has_advanced_models and zeroshot_classifier:
            for topic in topics:
                try:
                    candidate_labels = [", ".join(topic['terms'][:3]), 
                                       ", ".join(topic['terms'][3:6]),
                                       ", ".join(topic['terms'][6:9])]
                    
                    # Use the top comment as input for labeling
                    if topic['comments']:
                        result = zeroshot_classifier(
                            topic['comments'][0]['text'], 
                            candidate_labels
                        )
                        topic['label'] = result['labels'][0]
                    else:
                        topic['label'] = ", ".join(topic['terms'][:3])
                except:
                    topic['label'] = ", ".join(topic['terms'][:3])
        else:
            # Simple topic labeling
            for topic in topics:
                topic['label'] = ", ".join(topic['terms'][:3])
        
        self.report['topicAnalysis'] = {
            'method': 'NMF',
            'numTopics': num_topics,
            'topics': topics
        }
        
        return topics
    
    def identify_anomalies(self):
        """Detect anomalous or outlier comments"""
        if len(self.report['analyses']) < 20:
            return []  # Not enough data
        
        anomalies = []
        
        # Extract features for anomaly detection
        feature_vectors = []
        for comment in self.report['analyses']:
            # Features: sentiment score, subjectivity, text length, capitals ratio
            text = comment.get('text', '')
            sentiment = comment['sentiment']['score']
            subjectivity = comment['sentiment']['textblob']['subjectivity']
            text_length = len(text)
            capitals_ratio = sum(1 for c in text if c.isupper()) / max(1, len(text))
            
            # Create feature vector
            features = [sentiment, subjectivity, text_length, capitals_ratio]
            feature_vectors.append(features)
        
        # Convert to numpy array
        X = np.array(feature_vectors)
        
        # Standardize features
        X_scaled = stats.zscore(X, axis=0, nan_policy='omit')
        
        # Replace NaNs with 0
        X_scaled = np.nan_to_num(X_scaled)
        
        # Use DBSCAN for anomaly detection
        dbscan = DBSCAN(eps=1.5, min_samples=3)
        clusters = dbscan.fit_predict(X_scaled)
        
        # Find outliers (cluster label -1)
        outlier_indices = np.where(clusters == -1)[0]
        
        # Compute Mahalanobis distance for all points
        cov = np.cov(X_scaled.T)
        try:
            inv_cov = np.linalg.inv(cov)
            mean_vec = np.mean(X_scaled, axis=0)
            
            for i, features in enumerate(X_scaled):
                # Calculate Mahalanobis distance
                mahalanobis = np.sqrt(np.dot(np.dot((features - mean_vec), inv_cov), (features - mean_vec).T))
                
                # Check if outlier or has high Mahalanobis distance
                if i in outlier_indices or mahalanobis > 10:
                    comment = self.report['analyses'][i]
                    
                    anomalies.append({
                        'commentId': comment.get('commentId'),
                        'text': comment.get('text'),
                        'sentiment': comment['sentiment']['score'],
                        'mahalanobis': float(mahalanobis),
                        'features': feature_vectors[i],
                        'reason': 'Statistical outlier based on sentiment and text features'
                    })
        except:
            # Fallback if covariance matrix is singular
            for i in outlier_indices:
                comment = self.report['analyses'][i]
                anomalies.append({
                    'commentId': comment.get('commentId'),
                    'text': comment.get('text'),
                    'sentiment': comment['sentiment']['score'],
                    'features': feature_vectors[i],
                    'reason': 'DBSCAN outlier'
                })
        
        # Sort anomalies by Mahalanobis distance if available
        if anomalies and 'mahalanobis' in anomalies[0]:
            anomalies.sort(key=lambda x: x['mahalanobis'], reverse=True)
        
        self.report['anomalies'] = anomalies
        return anomalies
    
    def create_recommendation_network(self):
        """Create a network of relationships between products"""
        if not self.report['analyses']:
            return {}
            
        # Initialize network
        network = {
            'nodes': [],
            'links': []
        }
        
        # Create graph
        G = nx.Graph()
        
        # Add product nodes
        for product_id, summary in self.report.get('productSummaries', {}).items():
            G.add_node(product_id, 
                      name=summary.get('productName', ''),
                      sentiment=summary.get('avgSentiment', 0),
                      count=summary.get('commentCount', 0))
        
        # Find co-mentions in comments
        product_mentions = defaultdict(set)
        for comment in self.report['analyses']:
            text = comment.get('text', '').lower()
            
            for product_id, summary in self.report.get('productSummaries', {}).items():
                product_name = summary.get('productName', '').lower()
                if product_name and product_name in text:
                    product_mentions[comment.get('commentId')].add(product_id)
        
        # Create edges for co-mentions
        for comment_id, products in product_mentions.items():
            products = list(products)
            for i in range(len(products)):
                for j in range(i + 1, len(products)):
                    if G.has_edge(products[i], products[j]):
                        G[products[i]][products[j]]['weight'] += 1
                    else:
                        G.add_edge(products[i], products[j], weight=1)
        
        # Convert to JSON format
        for node, data in G.nodes(data=True):
            network['nodes'].append({
                'id': node,
                'name': data.get('name', ''),
                'sentiment': data.get('sentiment', 0),
                'count': data.get('count', 0)
            })
        
        for source, target, data in G.edges(data=True):
            network['links'].append({
                'source': source,
                'target': target,
                'weight': data.get('weight', 1)
            })
        
        self.report['recommendationNetwork'] = network
        return network
    
    def generate_insights(self):
        """Generate key insights from the analysis"""
        insights = []
        
        # Get overall statistics
        avg_sentiment = None
        if self.report['analyses']:
            sentiments = [c['sentiment']['score'] for c in self.report['analyses']]
            avg_sentiment = sum(sentiments) / len(sentiments)
            
            # Overall sentiment insight
            sentiment_desc = "neutral"
            if avg_sentiment > 0.5:
                sentiment_desc = "very positive"
            elif avg_sentiment > 0.2:
                sentiment_desc = "positive"
            elif avg_sentiment < -0.5:
                sentiment_desc = "very negative"
            elif avg_sentiment < -0.2:
                sentiment_desc = "negative"
                
            insights.append({
                'type': 'overall_sentiment',
                'text': f"Overall sentiment is {sentiment_desc} with an average score of {avg_sentiment:.2f}.",
                'score': abs(avg_sentiment)
            })
        
        # Top sentiment drivers
        if 'sentimentDrivers' in self.report:
            # Positive drivers
            if self.report['sentimentDrivers'].get('positive'):
                top_positive = self.report['sentimentDrivers']['positive'][0]
                insights.append({
                    'type': 'positive_driver',
                    'text': f"'{top_positive['feature']}' is the top positive feature with {top_positive['mentions']} mentions and {top_positive['avgSentiment']:.2f} sentiment.",
                    'score': top_positive['impact'],
                    'feature': top_positive['feature']
                })
            
            # Negative drivers
            if self.report['sentimentDrivers'].get('negative'):
                top_negative = self.report['sentimentDrivers']['negative'][0]
                insights.append({
                    'type': 'negative_driver',
                    'text': f"'{top_negative['feature']}' is the top concern with {top_negative['mentions']} mentions and {top_negative['avgSentiment']:.2f} sentiment.",
                    'score': top_negative['impact'],
                    'feature': top_negative['feature']
                })
            
            # Mixed sentiment features
            if self.report['sentimentDrivers'].get('mixed'):
                top_mixed = self.report['sentimentDrivers']['mixed'][0]
                insights.append({
                    'type': 'mixed_sentiment',
                    'text': f"'{top_mixed['feature']}' has mixed reception with {top_mixed['positive']} positive and {top_mixed['negative']} negative mentions.",
                    'score': top_mixed['impact'] * 0.8,
                    'feature': top_mixed['feature']
                })
        
        # Critical issues
        critical_comments = [c for c in self.report['analyses'] 
                            if c['sentiment'].get('criticality') in ('critical', 'high')]
        
        if critical_comments:
            insights.append({
                'type': 'critical_issues',
                'text': f"Found {len(critical_comments)} high-priority comments requiring attention.",
                'score': 0.9,
                'count': len(critical_comments)
            })
        
        # Topic insights
        if 'topicAnalysis' in self.report and self.report['topicAnalysis'].get('topics'):
            # Find most negative and positive topics
            topics = self.report['topicAnalysis']['topics']
            topics_by_sentiment = sorted(topics, key=lambda x: x['sentiment'])
            
            if topics_by_sentiment:
                most_negative = topics_by_sentiment[0]
                most_positive = topics_by_sentiment[-1]
                
                if most_negative['sentiment'] < -0.3:
                    insights.append({
                        'type': 'negative_topic',
                        'text': f"The topic '{most_negative.get('label')}' has the most negative sentiment at {most_negative['sentiment']:.2f}.",
                        'score': abs(most_negative['sentiment']),
                        'topic': most_negative.get('label')
                    })
                
                if most_positive['sentiment'] > 0.3:
                    insights.append({
                        'type': 'positive_topic',
                        'text': f"The topic '{most_positive.get('label')}' has the most positive sentiment at {most_positive['sentiment']:.2f}.",
                        'score': most_positive['sentiment'],
                        'topic': most_positive.get('label')
                    })
        
        # Product-specific insights
        if self.report['productSummaries']:
            # Find best and worst-rated products
            products = list(self.report['productSummaries'].values())
            products_by_sentiment = sorted(products, key=lambda x: x.get('avgSentiment', 0))
            
            if len(products) >= 2:
                worst_product = products_by_sentiment[0]
                best_product = products_by_sentiment[-1]
                
                insights.append({
                    'type': 'product_comparison',
                    'text': f"'{best_product['productName']}' has the highest sentiment ({best_product['avgSentiment']:.2f}), while '{worst_product['productName']}' has the lowest ({worst_product['avgSentiment']:.2f}).",
                    'score': 0.7
                })
        
        # Anomaly insights
        if self.report['anomalies']:
            insights.append({
                'type': 'anomalies',
                'text': f"Detected {len(self.report['anomalies'])} unusual comments that may need special attention.",
                'score': 0.6,
                'count': len(self.report['anomalies'])
            })
        
        # Sort insights by importance
        insights.sort(key=lambda x: x['score'], reverse=True)
        self.report['insights'] = insights
        
        return insights
    
    def analyze(self):
        """Run all analyses and generate the complete report"""
        self.analyze_all_comments()
        self.generate_product_summaries()
        self.identify_sentiment_drivers()
        self.perform_topic_modeling()
        self.identify_anomalies()
        self.create_recommendation_network()
        self.generate_insights()
        
        return self.report
    
    def save_report(self, filename=None):
        """Save the analysis report to a JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{REPORT_DIRECTORY}/sentiment_report_{timestamp}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, indent=2, ensure_ascii=False)
        
        return filename
    
    def generate_visualizations(self, output_dir=None):
        """Generate visualization charts for the report"""
        if output_dir is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_dir = f"{REPORT_DIRECTORY}/visualizations_{timestamp}"
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Sentiment distribution pie chart
        if self.report['analyses']:
            sentiments = [c['sentiment']['label'] for c in self.report['analyses']]
            sentiment_counts = Counter(sentiments)
            
            plt.figure(figsize=(10, 6))
            plt.pie(
                sentiment_counts.values(),
                labels=sentiment_counts.keys(),
                autopct='%1.1f%%',
                colors=['red', 'lightcoral', 'lightgray', 'lightgreen', 'green']
            )
            plt.title('Sentiment Distribution')
            plt.savefig(f"{output_dir}/sentiment_distribution.png")
            plt.close()
            
            # Emotion distribution
            emotions = [c['sentiment']['dominantEmotion'] for c in self.report['analyses']]
            emotion_counts = Counter(emotions)
            
            plt.figure(figsize=(12, 6))
            sns.barplot(x=list(emotion_counts.keys()), y=list(emotion_counts.values()))
            plt.title('Emotion Distribution')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(f"{output_dir}/emotion_distribution.png")
            plt.close()
            
            # Topic sentiment chart
            if 'topicAnalysis' in self.report and self.report['topicAnalysis'].get('topics'):
                topics = self.report['topicAnalysis']['topics']
                
                plt.figure(figsize=(12, 6))
                topic_labels = [t.get('label', f"Topic {t['id']}") for t in topics]
                topic_sentiments = [t['sentiment'] for t in topics]
                
                bars = sns.barplot(x=topic_labels, y=topic_sentiments)
                plt.title('Topic Sentiment Analysis')
                plt.xticks(rotation=45)
                plt.tight_layout()
                
                # Add color based on sentiment
                for i, sentiment in enumerate(topic_sentiments):
                    if sentiment > 0:
                        bars.patches[i].set_facecolor('green')
                    else:
                        bars.patches[i].set_facecolor('red')
                
                plt.savefig(f"{output_dir}/topic_sentiment.png")
                plt.close()
            
            # Word cloud for most frequent terms
            all_text = ' '.join([c['text'] for c in self.report['analyses']])
            wordcloud = WordCloud(
                width=800, 
                height=400,
                background_color='white',
                max_words=100,
                contour_width=3
            ).generate(all_text)
            
            plt.figure(figsize=(16, 8))
            plt.imshow(wordcloud, interpolation='bilinear')
            plt.axis('off')
            plt.tight_layout()
            plt.savefig(f"{output_dir}/wordcloud.png")
            plt.close()
            
            # Feature sentiment impact
            if 'sentimentDrivers' in self.report:
                # Combine positive and negative drivers
                all_drivers = []
                for driver in self.report['sentimentDrivers'].get('positive', [])[:5]:
                    all_drivers.append({
                        'feature': driver['feature'],
                        'impact': driver['impact'],
                        'sentiment': driver['avgSentiment']
                    })
                
                for driver in self.report['sentimentDrivers'].get('negative', [])[:5]:
                    all_drivers.append({
                        'feature': driver['feature'],
                        'impact': -driver['impact'],  # Negative impact
                        'sentiment': driver['avgSentiment']
                    })
                
                if all_drivers:
                    # Sort by absolute impact
                    all_drivers.sort(key=lambda x: abs(x['impact']), reverse=True)
                    
                    plt.figure(figsize=(12, 6))
                    feature_names = [d['feature'] for d in all_drivers]
                    impacts = [d['impact'] for d in all_drivers]
                    
                    bars = plt.barh(feature_names, impacts)
                    
                    # Color positive green, negative red
                    for i, impact in enumerate(impacts):
                        if impact > 0:
                            bars[i].set_color('green')
                        else:
                            bars[i].set_color('red')
                    
                    plt.title('Feature Sentiment Impact')
                    plt.xlabel('Impact Score (Positive/Negative)')
                    plt.tight_layout()
                    plt.savefig(f"{output_dir}/feature_impact.png")
                    plt.close()
        
        return output_dir


# Example usage
if __name__ == "__main__":
    # Test with sample data
    test_comments = [
        {
            "commentId": "c1",
            "productId": "p1",
            "productName": "Super Phone X",
            "text": "I absolutely love this phone! The camera quality is amazing and the battery lasts all day.",
            "rating": 5
        },
        {
            "commentId": "c2",
            "productId": "p1",
            "productName": "Super Phone X",
            "text": "Decent phone but the battery drains too quickly. The camera is great though!",
            "rating": 3
        },
        {
            "commentId": "c3",
            "productId": "p2",
            "productName": "Ultra Tablet Pro",
            "text": "This tablet is terrible. It crashes constantly and customer support is unhelpful.",
            "rating": 1
        }
    ]
    
    analyzer = EnhancedSentimentAnalyzer(test_comments)
    report = analyzer.analyze()
    report_file = analyzer.save_report()
    viz_dir = analyzer.generate_visualizations()
    
    print(f"Analysis complete. Report saved to {report_file}")
    print(f"Visualizations saved to {viz_dir}")