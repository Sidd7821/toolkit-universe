import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  Link, 
  Play,
  Pause,
  Trash2,
  MoveUp,
  MoveDown,
  Volume2,
  Clock,
  FileAudio,
  AlertTriangle,
  CheckCircle,
  GripVertical
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioFile {
  id: string;
  file: File;
  url: string;
  name: string;
  duration: number;
  size: string;
}

const AudioJoiner = () => {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudio, setProcessedAudio] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("wav");
  const [fadeInOut, setFadeInOut] = useState<boolean>(false);
  const [isJoinedPlaying, setIsJoinedPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const joinedAudioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const supportedFormats = [
    { value: "wav", label: "WAV", description: "High quality, larger size" },
    { value: "mp3", label: "MP3", description: "Compressed, smaller size" },
  ];

  // Load lamejs dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const newAudioFiles = await Promise.all(files.map(async file => {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid audio file`,
          variant: "destructive"
        });
        return null;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const url = URL.createObjectURL(file);
      const size = (file.size / (1024 * 1024)).toFixed(2) + " MB";
      
      const audio = new Audio(url);
      const duration = await new Promise<number>(resolve => {
        audio.addEventListener('loadedmetadata', () => resolve(audio.duration), { once: true });
      });

      return { id, file, url, name: file.name, duration, size };
    }));

    const validFiles = newAudioFiles.filter((file): file is AudioFile => file !== null);
    
    setAudioFiles(prev => [...prev, ...validFiles]);
    
    toast({
      title: "Files added",
      description: `${validFiles.length} audio file(s) have been added`,
    });
  };

  const removeFile = (id: string) => {
    setAudioFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      return prev.filter(f => f.id !== id);
    });
    
    if (currentPlayingId === id) {
      setIsPlaying(false);
      setCurrentPlayingId(null);
    }
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setAudioFiles(prev => {
      const index = prev.findIndex(f => f.id === id);
      if (index === -1) return prev;
      
      const newFiles = [...prev];
      if (direction === 'up' && index > 0) {
        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      }
      
      return newFiles;
    });
  };

  const playFile = (id: string) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    
    Object.values(audioRefs.current).forEach(a => a.pause());
    if (joinedAudioRef.current) joinedAudioRef.current.pause();
    
    if (currentPlayingId === id && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setCurrentPlayingId(null);
    } else {
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
      setCurrentPlayingId(id);
      setIsJoinedPlaying(false);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentPlayingId(null);
      }, { once: true });
    }
  };

  const playJoinedAudio = () => {
    if (!joinedAudioRef.current || !processedAudio) return;
    
    Object.values(audioRefs.current).forEach(a => a.pause());
    
    if (isJoinedPlaying) {
      joinedAudioRef.current.pause();
      setIsJoinedPlaying(false);
    } else {
      joinedAudioRef.current.currentTime = 0;
      joinedAudioRef.current.play();
      setIsJoinedPlaying(true);
      setIsPlaying(true);
      setCurrentPlayingId(null);
      
      joinedAudioRef.current.addEventListener('ended', () => {
        setIsJoinedPlaying(false);
        setIsPlaying(false);
      }, { once: true });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    return audioFiles.reduce((total, file) => total + file.duration, 0);
  };

  const getTotalSize = () => {
    return audioFiles.reduce((total, file) => total + file.file.size, 0);
  };

  const processAudio = async () => {
    if (audioFiles.length < 2) {
      toast({
        title: "Not enough files",
        description: "Please add at least 2 audio files to join",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Decode all audio files
      const buffers = await Promise.all(
        audioFiles.map(async file => {
          try {
            const arrayBuffer = await file.file.arrayBuffer();
            return await audioCtx.decodeAudioData(arrayBuffer);
          } catch (error) {
            throw new Error(`Failed to decode ${file.name}`);
          }
        })
      );

      // Validate compatibility
      const sampleRate = buffers[0].sampleRate;
      const channels = buffers[0].numberOfChannels;
      if (buffers.some(buf => buf.sampleRate !== sampleRate || buf.numberOfChannels !== channels)) {
        throw new Error("All audio files must have the same sample rate and number of channels");
      }

      // Calculate total length
      const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);

      // Create output buffer
      const outputBuffer = audioCtx.createBuffer(channels, totalLength, sampleRate);

      let offset = 0;
      buffers.forEach(buf => {
        for (let ch = 0; ch < channels; ch++) {
          outputBuffer.getChannelData(ch).set(buf.getChannelData(ch), offset);
        }
        offset += buf.length;
      });

      // Apply fade in/out
      if (fadeInOut) {
        const fadeLength = Math.floor(sampleRate * 1.5); // 1.5 seconds fade
        for (let ch = 0; ch < channels; ch++) {
          const channelData = outputBuffer.getChannelData(ch);
          // Fade in
          for (let i = 0; i < Math.min(fadeLength, channelData.length); i++) {
            channelData[i] *= i / fadeLength;
          }
          // Fade out
          for (let i = 0; i < Math.min(fadeLength, channelData.length); i++) {
            const idx = channelData.length - fadeLength + i;
            if (idx >= 0) {
              channelData[idx] *= 1 - i / fadeLength;
            }
          }
        }
      }

      let blob: Blob;
      if (outputFormat === "mp3") {
        if (!(window as any).lamejs) {
          throw new Error("MP3 encoding library not loaded");
        }
        blob = bufferToMp3Blob(outputBuffer);
      } else {
        blob = bufferToWavBlob(outputBuffer);
      }

      const url = URL.createObjectURL(blob);
      setProcessedAudio(url);

      toast({
        title: "Audio joined successfully",
        description: `${audioFiles.length} files have been merged into one ${outputFormat.toUpperCase()} file`,
        variant: "default"
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Processing failed",
        description: error.message || "An error occurred while joining the audio files",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const bufferToWavBlob = (buffer: AudioBuffer): Blob => {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);

    let offset = 0;
    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        view.setUint8(offset++, s.charCodeAt(i));
      }
    };

    writeString("RIFF");
    view.setUint32(offset, 36 + buffer.length * numOfChannels * 2, true); offset += 4;
    writeString("WAVE");
    writeString("fmt ");
    view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, numOfChannels, true); offset += 2;
    view.setUint32(offset, buffer.sampleRate, true); offset += 4;
    view.setUint32(offset, buffer.sampleRate * numOfChannels * 2, true); offset += 4;
    view.setUint16(offset, numOfChannels * 2, true); offset += 2;
    view.setUint16(offset, 16, true); offset += 2;
    writeString("data");
    view.setUint32(offset, buffer.length * numOfChannels * 2, true); offset += 4;

    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numOfChannels; ch++) {
        let sample = buffer.getChannelData(ch)[i];
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([bufferArray], { type: "audio/wav" });
  };

  const bufferToMp3Blob = (buffer: AudioBuffer): Blob => {
    const Lame = (window as any).lamejs;
    if (!Lame) {
      throw new Error("MP3 encoding library not available");
    }

    const mp3Encoder = new Lame.Mp3Encoder(buffer.numberOfChannels, buffer.sampleRate, 192);
    const mp3Data: number[] = [];
    
    const samplesPerChannel = buffer.length;
    const sampleBlockSize = 1152; // MP3 frame size

    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      const channelData = buffer.getChannelData(ch);
      const samples = new Int16Array(samplesPerChannel);
      
      for (let i = 0; i < samplesPerChannel; i++) {
        samples[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7fff;
      }

      for (let i = 0; i < samplesPerChannel; i += sampleBlockSize) {
        const sampleChunk = samples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
          mp3Data.push(...mp3buf);
        }
      }
    }

    const finalMp3buf = mp3Encoder.flush();
    if (finalMp3buf.length > 0) {
      mp3Data.push(...finalMp3buf);
    }

    return new Blob([new Uint8Array(mp3Data)], { type: "audio/mp3" });
  };

  const downloadAudio = () => {
    if (!processedAudio) return;
    
    const link = document.createElement('a');
    link.href = processedAudio;
    link.download = `joined-audio.${outputFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    audioFiles.forEach(file => URL.revokeObjectURL(file.url));
    if (processedAudio) URL.revokeObjectURL(processedAudio);
    setAudioFiles([]);
    setIsPlaying(false);
    setCurrentPlayingId(null);
    setIsJoinedPlaying(false);
    setProcessedAudio("");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Upload and List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Audio Files
              </CardTitle>
              <CardDescription>
                Add multiple audio files to join them together
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Audio Files
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  WAV or MP3 recommended • Max 50MB each
                </p>
              </div>

              {audioFiles.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {audioFiles.length} file(s) • {formatTime(getTotalDuration())} • {(getTotalSize() / (1024 * 1024)).toFixed(2)} MB
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {audioFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileAudio className="w-5 h-5" />
                  Audio Files ({audioFiles.length})
                </CardTitle>
                <CardDescription>
                  Drag to reorder or click to preview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audioFiles.map((file, index) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{file.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {file.size}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(file.duration)}
                          </span>
                          <span>#{index + 1}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => playFile(file.id)}
                        >
                          {currentPlayingId === file.id && isPlaying ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveFile(file.id, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveFile(file.id, 'down')}
                          disabled={index === audioFiles.length - 1}
                        >
                          <MoveDown className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFile(file.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <audio
                        ref={el => {
                          if (el) audioRefs.current[file.id] = el;
                        }}
                        src={file.url}
                        preload="metadata"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Output Settings
              </CardTitle>
              <CardDescription>
                Configure the output options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Output Format</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {supportedFormats.map(format => (
                    <div
                      key={format.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        outputFormat === format.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setOutputFormat(format.value)}
                    >
                      <div className="font-medium">{format.label}</div>
                      <div className="text-xs text-muted-foreground">{format.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fadeInOut"
                  checked={fadeInOut}
                  onChange={(e) => setFadeInOut(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="fadeInOut" className="text-sm">
                  Add fade in/out effects
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Join Audio
              </CardTitle>
              <CardDescription>
                Merge your audio files into one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={processAudio}
                disabled={audioFiles.length < 2 || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 mr-2" />
                    Join Audio Files ({audioFiles.length})
                  </>
                )}
              </Button>
              
              {audioFiles.length >= 2 && (
                <div className="text-sm text-muted-foreground">
                  <p>Total duration: {formatTime(getTotalDuration())}</p>
                  <p>Output format: {outputFormat.toUpperCase()}</p>
                  {fadeInOut && <p>Fade effects: Enabled</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {processedAudio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileAudio className="w-5 h-5" />
                  Joined Audio
                </CardTitle>
                <CardDescription>
                  Preview or download the joined audio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={playJoinedAudio}
                    variant="outline"
                    size="sm"
                  >
                    {isJoinedPlaying ? (
                      <Pause className="w-4 h-4 mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isJoinedPlaying ? "Pause" : "Play"} Joined Audio
                  </Button>
                  <Button
                    onClick={downloadAudio}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                <audio
                  ref={joinedAudioRef}
                  src={processedAudio}
                  preload="metadata"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioJoiner;