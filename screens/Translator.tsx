import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function Translator({ navigation }: any) {
  const [englishText, setEnglishText] = useState('');
  const [spanishText, setSpanishText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Translate English to Spanish using MyMemory API (free)
  const translateToSpanish = async () => {
    if (!englishText.trim()) {
      Alert.alert('Error', 'Please enter some text to translate');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|es`
      );
      
      if (response.data && response.data.responseData) {
        const translated = response.data.responseData.translatedText;
        setSpanishText(translated);
        
        // Automatically speak the Spanish translation
        speakSpanish(translated);
      } else {
        Alert.alert('Error', 'Translation failed. Please try again.');
      }
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert('Error', 'Please check your internet connection.');
    }
    setIsLoading(false);
  };

  // Speak Spanish text
  const speakSpanish = (text: string) => {
    if (!text.trim()) return;
    
    Speech.speak(text, {
      language: 'es-ES',
      pitch: 1.0,
      rate: 0.8,
      onDone: () => console.log('Finished speaking'),
      onError: (error) => {
        console.error('Speech error:', error);
        Alert.alert('Error', 'Speech synthesis failed');
      }
    });
  };

  // Clear all text
  const clearAll = () => {
    setEnglishText('');
    setSpanishText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#004d9f" />
        </TouchableOpacity>
        <Text style={styles.title}>English to Spanish</Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Type in English:</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter English text here..."
          value={englishText}
          onChangeText={setEnglishText}
          multiline={true}
          numberOfLines={4}
        />
        
        <TouchableOpacity 
          style={[styles.translateButton, isLoading && styles.buttonDisabled]}
          onPress={translateToSpanish}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Translating...' : 'Translate & Speak'}
          </Text>
          <Ionicons name="language" size={20} color="#fff" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>

      {/* Output Section */}
      {spanishText ? (
        <View style={styles.outputSection}>
          <Text style={styles.label}>Spanish Translation:</Text>
          <View style={styles.translationContainer}>
            <Text style={styles.translationText}>{spanishText}</Text>
            <TouchableOpacity 
              style={styles.speakButton}
              onPress={() => speakSpanish(spanishText)}
            >
              <Ionicons name="volume-high" size={24} color="#004d9f" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Quick Phrases */}
      <View style={styles.quickPhrasesSection}>
        <Text style={styles.label}>Quick Phrases:</Text>
        {quickPhrases.map((phrase, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.phraseButton}
            onPress={() => {
              setEnglishText(phrase.english);
              setSpanishText(phrase.spanish);
            }}
          >
            <Text style={styles.phraseEnglish}>{phrase.english}</Text>
            <Text style={styles.phraseSpanish}>{phrase.spanish}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Clear Button */}
      <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
        <Text style={styles.clearButtonText}>Clear All</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Quick phrases for Barcelona travelers
const quickPhrases = [
  { english: "Hello", spanish: "Hola" },
  { english: "Thank you", spanish: "Gracias" },
  { english: "Where is Camp Nou?", spanish: "¿Dónde está el Camp Nou?" },
  { english: "How much does this cost?", spanish: "¿Cuánto cuesta esto?" },
  { english: "I need help", spanish: "Necesito ayuda" },
  { english: "Where is the bathroom?", spanish: "¿Dónde está el baño?" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004d9f',
  },
  inputSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  translateButton: {
    backgroundColor: '#004d9f',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 10,
  },
  outputSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  translationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  translationText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    padding: 15,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    marginRight: 10,
  },
  speakButton: {
    padding: 10,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
  },
  quickPhrasesSection: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  phraseButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  phraseEnglish: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  phraseSpanish: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  clearButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    margin: 15,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
