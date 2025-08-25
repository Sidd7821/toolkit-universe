import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Download, 
  Play,
  Pause,
  Volume2,
  Clock,
  FileAudio,
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AudioNoiseRemover = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudio, setProcessedAudio] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [originalAudio, setOriginalAudio] = useState<string>("");
  const [noiseReductionLevel, setNoiseReductionLevel] = useState([50]);
  const [filterType, setFilterType] = useState("lowpass");
  const [frequency, setFrequency] = useState([1000]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const processedAudioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const filterTypes = [
    { value: "lowpass", label: "Low Pass Filter", description: "Remove high-frequency noise" },
    { value: "highpass", label: "High Pass Filter", description: "Remove low-frequency noise" },
    { value: "bandpass", label: "Band Pass Filter", description: "Keep specific frequency range" },
    { value: "notch", label: "Notch Filter", description: "Remove specific frequency" },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid audio file",
        variant: "destructive"
      });
      return;
    }

    setAudioFile(file);
    setOriginalAudio(URL.createObjectURL(file));
    setProcessedAudio("");
    setIsPlaying(false);
    
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully`,
    });
  };

  const processAudio = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const response = await fetch(originalAudio);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Create offline context for processing
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // Create source
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create filters based on selected type
      const filters: BiquadFilterNode[] = [];
      
      if (filterType === "lowpass") {
        const lowpass = offlineContext.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = frequency[0];
        lowpass.Q.value = 1;
        filters.push(lowpass);
      } else if (filterType === "highpass") {
        const highpass = offlineContext.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = frequency[0];
        highpass.Q.value = 1;
        filters.push(highpass);
      } else if (filterType === "bandpass") {
        const bandpass = offlineContext.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.value = frequency[0];
        bandpass.Q.value = 10;
        filters.push(bandpass);
      } else if (filterType === "notch") {
        const notch = offlineContext.createBiquadFilter();
        notch.type = "notch";
        notch.frequency.value = frequency[0];
        notch.Q.value = 10;
        filters.push(notch);
      }

      // Create gain node for noise reduction
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = (100 - noiseReductionLevel[0]) / 100;

      // Connect nodes
      source.connect(filters[0]);
      filters.forEach((filter, index) => {
        if (index < filters.length - 1) {
          filter.connect(filters[index + 1]);
        } else {
          filter.connect(gainNode);
        }
      });
      gainNode.connect(offlineContext.destination);

      // Start processing
      source.start(0);
      const renderedBuffer = await offlineContext.startRendering();

      // Convert to blob
      const wavBlob = await audioBufferToWav(renderedBuffer);
      const processedUrl = URL.createObjectURL(wavBlob);
      setProcessedAudio(processedUrl);

      toast({
        title: "Processing complete",
        description: "Audio noise reduction has been applied successfully",
      });

    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing failed",
        description: "An error occurred while processing the audio",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to convert AudioBuffer to WAV blob
  const audioBufferToWav = async (buffer: AudioBuffer): Promise<Blob> => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const togglePlayback = (type: 'original' | 'processed') => {
    const audio = type === 'original' ? audioRef.current : processedAudioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (!processedAudio) return;
    
    const link = document.createElement('a');
    link.href = processedAudio;
    link.download = `noise-removed-${audioFile?.name || 'audio'}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Audio File
          </CardTitle>
          <CardDescription>
            Select an audio file to remove background noise. Supports MP3, WAV, and other common formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {audioFile && (
                <div className="flex items-center gap-2 text-sm">
                  <FileAudio className="h-4 w-4 text-primary" />
                  <span className="font-medium">{audioFile.name}</span>
                  <Badge variant="secondary">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing Controls */}
      {audioFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Noise Reduction Settings
            </CardTitle>
            <CardDescription>
              Configure the noise reduction parameters for optimal results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter Type */}
            <div className="space-y-2">
              <Label>Filter Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterTypes.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      <div>
                        <div className="font-medium">{filter.label}</div>
                        <div className="text-xs text-muted-foreground">{filter.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Frequency Control */}
            <div className="space-y-2">
              <Label>Frequency: {frequency[0]} Hz</Label>
              <Slider
                value={frequency}
                onValueChange={setFrequency}
                max={20000}
                min={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20 Hz</span>
                <span>20 kHz</span>
              </div>
            </div>

            {/* Noise Reduction Level */}
            <div className="space-y-2">
              <Label>Noise Reduction Level: {noiseReductionLevel[0]}%</Label>
              <Slider
                value={noiseReductionLevel}
                onValueChange={setNoiseReductionLevel}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>None</span>
                <span>Maximum</span>
              </div>
            </div>

            <Button
              onClick={processAudio}
              disabled={isProcessing || !audioFile}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Remove Noise
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Audio Preview */}
      {originalAudio && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Audio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Original Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <audio
                ref={audioRef}
                src={originalAudio}
                controls
                className="w-full"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </CardContent>
          </Card>

          {/* Processed Audio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Processed Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {processedAudio ? (
                <div className="space-y-4">
                  <audio
                    ref={processedAudioRef}
                    src={processedAudio}
                    controls
                    className="w-full"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Processed Audio
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-muted-foreground text-center">
                    Process audio to see results
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Tips for Best Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use high-quality audio files for better results</li>
            <li>• Low Pass Filter works best for removing high-frequency noise</li>
            <li>• High Pass Filter is ideal for removing low-frequency hum</li>
            <li>• Adjust frequency settings based on the type of noise</li>
            <li>• Start with lower noise reduction levels and increase gradually</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioNoiseRemover;
