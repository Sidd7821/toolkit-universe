
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Scissors, Play, Pause, Volume2, Clock, FileAudio, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioSegment {
  start: number;
  end: number;
  duration: number;
}

const AudioCutter = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string>("");
  const [volume, setVolume] = useState(1);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const { toast } = useToast();

  // Initialize AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);

    return () => {
      stopPlayback();
      audioContextRef.current?.close();
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current!.currentTime);
    }
  }, [volume]);

  // Timer update for smooth display
  const updateCurrentTime = useCallback(() => {
    if (audioContextRef.current && isPlaying) {
      const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
      setCurrentTime(elapsed);
      animationFrameRef.current = requestAnimationFrame(updateCurrentTime);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updateCurrentTime);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isPlaying, updateCurrentTime]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("audio/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file (MP3, WAV, OGG, etc.)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an audio file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        setAudioFile(file);
        setAudioBuffer(audioBuffer);
        setDuration(audioBuffer.duration);
        setSegments([]);
        setSelectedSegment(null);
        setProcessedAudioUrl("");
        setCurrentTime(0);

        toast({
          title: "Audio file loaded",
          description: `${file.name} has been uploaded successfully`,
        });
      } catch (error) {
        toast({
          title: "File loading failed",
          description: `Error loading audio file: ${(error as Error).message}`,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (isPlaying) {
      stopPlayback();
    } else {
      sourceNodeRef.current = audioContextRef.current.createBufferSource();
      sourceNodeRef.current.buffer = audioBuffer;
      sourceNodeRef.current.connect(gainNodeRef.current!);
      sourceNodeRef.current.start(0, currentTime);
      startTimeRef.current = audioContextRef.current.currentTime - currentTime;
      sourceNodeRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      setIsPlaying(true);
    }
  }, [audioBuffer, currentTime, isPlaying, stopPlayback]);

  const playSegment = useCallback(
    (segment: AudioSegment) => {
      if (!audioBuffer || !audioContextRef.current) return;

      stopPlayback();
      sourceNodeRef.current = audioContextRef.current.createBufferSource();
      sourceNodeRef.current.buffer = audioBuffer;
      sourceNodeRef.current.connect(gainNodeRef.current!);
      sourceNodeRef.current.start(0, segment.start, segment.end - segment.start);
      startTimeRef.current = audioContextRef.current.currentTime;
      setCurrentTime(segment.start);
      setIsPlaying(true);

      sourceNodeRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(segment.start);
      };
    },
    [audioBuffer, stopPlayback]
  );

  const handleSeek = useCallback(
    (value: number[]) => {
      const newTime = value[0];
      setCurrentTime(newTime);
      if (isPlaying && sourceNodeRef.current && audioContextRef.current) {
        stopPlayback();
        sourceNodeRef.current = audioContextRef.current.createBufferSource();
        sourceNodeRef.current.buffer = audioBuffer;
        sourceNodeRef.current.connect(gainNodeRef.current!);
        sourceNodeRef.current.start(0, newTime);
        startTimeRef.current = audioContextRef.current.currentTime - newTime;
        setIsPlaying(true);
      }
    },
    [audioBuffer, isPlaying, stopPlayback]
  );

  const formatTime = useCallback((time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const addSegment = useCallback(() => {
    if (!duration) return;

    const newSegment: AudioSegment = {
      start: Math.max(0, currentTime),
      end: Math.min(currentTime + 30, duration),
      duration: Math.min(30, duration - currentTime),
    };

    // Validate no overlap with existing segments
    const hasOverlap = segments.some(
      (seg) => newSegment.start < seg.end && newSegment.end > seg.start
    );
    if (hasOverlap) {
      toast({
        title: "Invalid segment",
        description: "Segments cannot overlap",
        variant: "destructive",
      });
      return;
    }

    setSegments((prev) => [...prev, newSegment]);
    setSelectedSegment(segments.length);
  }, [currentTime, duration, segments, toast]);

  const updateSegment = useCallback(
    (index: number, field: "start" | "end", value: number) => {
      setSegments((prev) => {
        const updatedSegments = [...prev];
        const segment = updatedSegments[index];

        if (field === "start" && value >= segment.end - 0.1) return prev;
        if (field === "end" && value <= segment.start + 0.1) return prev;

        updatedSegments[index] = {
          ...segment,
          [field]: value,
          duration: field === "start" ? segment.end - value : value - segment.start,
        };

        // Validate no overlap
        const hasOverlap = updatedSegments.some(
          (seg, i) =>
            i !== index &&
            updatedSegments[index].start < seg.end &&
            updatedSegments[index].end > seg.start
        );

        if (hasOverlap) {
          toast({
            title: "Invalid segment",
            description: "Segments cannot overlap",
            variant: "destructive",
          });
          return prev;
        }

        return updatedSegments;
      });
    },
    [toast]
  );

  const removeSegment = useCallback(
    (index: number) => {
      setSegments((prev) => prev.filter((_, i) => i !== index));
      if (selectedSegment === index) {
        setSelectedSegment(null);
      } else if (selectedSegment && selectedSegment > index) {
        setSelectedSegment((prev) => prev! - 1);
      }
    },
    [selectedSegment]
  );

  const processAudio = useCallback(async () => {
    if (segments.length === 0 || !audioBuffer || !audioContextRef.current) {
      toast({
        title: "No segments selected",
        description: "Please add at least one segment to cut",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const totalDuration = segments.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
      const outputBuffer = audioContextRef.current.createBuffer(
        audioBuffer.numberOfChannels,
        Math.ceil(totalDuration * audioBuffer.sampleRate),
        audioBuffer.sampleRate
      );

      let offset = 0;
      segments
        .sort((a, b) => a.start - b.start)
        .forEach((segment) => {
          const segmentLength = Math.ceil((segment.end - segment.start) * audioBuffer.sampleRate);
          for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const inputData = audioBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            const startSample = Math.floor(segment.start * audioBuffer.sampleRate);
            outputData.set(
              inputData.subarray(startSample, startSample + segmentLength),
              offset
            );
          }
          offset += segmentLength;
        });

      const wavBuffer = await audioBufferToWav(outputBuffer);
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setProcessedAudioUrl(url);

      toast({
        title: "Audio processed",
        description: `${segments.length} segment(s) have been cut successfully`,
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: `Error processing audio: ${(error as Error).message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [audioBuffer, segments, toast]);

  const audioBufferToWav = useCallback(async (buffer: AudioBuffer): Promise<ArrayBuffer> => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);

    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + buffer.length * numOfChan * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numOfChan * 2, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, buffer.length * numOfChan * 2, true);

    const offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChan; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset + (i * numOfChan + channel) * 2, sample * 0x7FFF, true);
      }
    }

    return bufferArray;
  }, []);

  const downloadAudio = useCallback(() => {
    if (!processedAudioUrl || !audioFile) return;

    const link = document.createElement("a");
    link.href = processedAudioUrl;
    link.download = `cut-${audioFile.name.split(".")[0]}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedAudioUrl, audioFile]);

  const totalSegmentDuration = useMemo(
    () => segments.reduce((sum, seg) => sum + seg.duration, 0),
    [segments]
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="w-5 h-5" />
                Audio Player
              </CardTitle>
              <CardDescription>Upload and preview your audio file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!audioBuffer ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="lg"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Audio File
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    MP3, WAV, OGG, M4A files up to 50MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{audioFile?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {formatTime(duration)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change File
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Button onClick={togglePlayPause} size="sm" disabled={!audioBuffer}>
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Slider
                        value={[currentTime]}
                        onValueChange={handleSeek}
                        max={duration}
                        step={0.01}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTime(0)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                      <Slider
                        value={[volume]}
                        onValueChange={(value) => setVolume(value[0])}
                        max={1}
                        step={0.01}
                        className="w-32"
                      />
                    </div>

                    <Button
                      onClick={addSegment}
                      variant="outline"
                      className="w-full"
                      disabled={!duration}
                    >
                      <Scissors className="w-4 h-4 mr-2" />
                      Add Segment at Current Time
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {segments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="w-5 h-5" />
                  Audio Segments ({segments.length})
                </CardTitle>
                <CardDescription>Manage your audio segments for cutting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {segments.map((segment, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${
                        selectedSegment === index ? "border-primary bg-primary/5" : "border-gray-200"
                      }`}
                      onClick={() => setSelectedSegment(index)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Segment {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => playSegment(segment)}
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeSegment(index)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Start Time</Label>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[segment.start]}
                              onValueChange={(value) => updateSegment(index, "start", value[0])}
                              max={segment.end - 0.1}
                              step={0.01}
                              className="flex-1"
                            />
                            <span className="text-xs font-mono w-12">
                              {formatTime(segment.start)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs">End Time</Label>
                          <div className="flex items-center gap-2">
                            <Slider
                              value={[segment.end]}
                              onValueChange={(value) => updateSegment(index, "end", value[0])}
                              min={segment.start + 0.1}
                              max={duration}
                              step={0.01}
                              className="flex-1"
                            />
                            <span className="text-xs font-mono w-12">
                              {formatTime(segment.end)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">
                        Duration: {formatTime(segment.duration)}
                      </div>
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
                <Scissors className="w-5 h-5" />
                Cut Audio
              </CardTitle>
              <CardDescription>Process your selected segments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={processAudio}
                disabled={segments.length === 0 || isProcessing}
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
                    <Scissors className="w-4 h-4 mr-2" />
                    Cut Audio ({segments.length} segments)
                  </>
                )}
              </Button>

              {segments.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  <p>Total segments: {segments.length}</p>
                  <p>Total duration: {formatTime(totalSegmentDuration)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {processedAudioUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Download
                </CardTitle>
                <CardDescription>Your processed audio is ready</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={downloadAudio} className="w-full" size="lg">


                  <Download className="w-4 h-4 mr-2" />
                  Download Cut Audio
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <p>• Use precise sliders for accurate segment timing</p>
              <p>• Preview segments before processing</p>
              <p>• Multiple segments can be combined</p>
              <p>• Supported formats: MP3, WAV, OGG, M4A</p>
              <p>• Maximum file size: 50MB</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AudioCutter;
