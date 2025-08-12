import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Download, Upload, Play, Copy, Share2, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'open-ended';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

const TriviaQuizMaker = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizCategory, setQuizCategory] = useState("general");
  const [quizDifficulty, setQuizDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: "",
    question: "",
    type: "multiple-choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    points: 1
  });
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const { toast } = useToast();

  const categories = ["general", "science", "history", "geography", "sports", "entertainment"];
  const questionTypes = [
    { value: "multiple-choice", label: "Multiple Choice" },
    { value: "true-false", label: "True/False" },
    { value: "open-ended", label: "Open Ended" }
  ];

  const createNewQuiz = () => {
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      title: "New Quiz",
      description: "Quiz description",
      category: "general",
      difficulty: "medium",
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingQuiz(newQuiz);
    setQuizTitle(newQuiz.title);
    setQuizDescription(newQuiz.description);
    setQuizCategory(newQuiz.category);
    setQuizDifficulty(newQuiz.difficulty);
    setTimeLimit(newQuiz.timeLimit);
    setQuestions([]);
    setActiveTab("edit");
  };

  const saveQuiz = () => {
    if (!quizTitle.trim() || questions.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a title and add questions",
        variant: "destructive",
      });
      return;
    }

    const quizToSave: Quiz = {
      id: editingQuiz?.id || Date.now().toString(),
      title: quizTitle.trim(),
      description: quizDescription.trim(),
      category: quizCategory,
      difficulty: quizDifficulty,
      timeLimit: timeLimit,
      questions: questions,
      createdAt: editingQuiz?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingQuiz) {
      setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? quizToSave : q));
    } else {
      setQuizzes([...quizzes, quizToSave]);
    }

    setEditingQuiz(null);
    setActiveTab("play");
    toast({ title: "Success", description: "Quiz saved successfully" });
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || !currentQuestion.correctAnswer.trim()) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const newQuestion: Question = {
      ...currentQuestion,
      id: Date.now().toString(),
      options: currentQuestion.type === "multiple-choice" ? currentQuestion.options : undefined
    };

    setQuestions([...questions, newQuestion]);
    resetQuestionForm();
    toast({ title: "Success", description: "Question added successfully" });
  };

  const resetQuestionForm = () => {
    setCurrentQuestion({
      id: "", question: "", type: "multiple-choice", options: ["", "", "", ""],
      correctAnswer: "", explanation: "", points: 1
    });
  };

  const handleQuestionTypeChange = (type: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      type: type as "multiple-choice" | "true-false" | "open-ended",
      options: type === "multiple-choice" ? ["", "", "", ""] : undefined
    });
  };

  const updateOption = (index: number, value: string) => {
    if (currentQuestion.options) {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      setCurrentQuestion({ ...currentQuestion, options: newOptions });
    }
  };

  const exportQuiz = (quiz: Quiz) => {
    const quizData = JSON.stringify(quiz, null, 2);
    const blob = new Blob([quizData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${quiz.title.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareQuiz = (quiz: Quiz) => {
    const quizData = btoa(JSON.stringify(quiz));
    const shareUrl = `${window.location.origin}${window.location.pathname}?quiz=${quizData}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({ title: "Success", description: "Quiz link copied to clipboard" });
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Trivia Quiz Maker</h1>
        <p className="text-center text-muted-foreground">
          Create, edit, and share interactive quizzes with multiple question types
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Quiz</TabsTrigger>
          <TabsTrigger value="edit">Edit Quiz</TabsTrigger>
          <TabsTrigger value="play">My Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Quiz</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={createNewQuiz} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Start New Quiz
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          {editingQuiz && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quizTitle">Quiz Title</Label>
                      <Input
                        id="quizTitle"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        placeholder="Enter quiz title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quizCategory">Category</Label>
                      <Select value={quizCategory} onValueChange={setQuizCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quizDifficulty">Difficulty</Label>
                      <Select value={quizDifficulty} onValueChange={(value: any) => setQuizDifficulty(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
                      <Input
                        id="timeLimit"
                        type="number"
                        value={timeLimit || ""}
                        onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="No limit"
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="quizDescription">Description</Label>
                    <Textarea
                      id="quizDescription"
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      placeholder="Enter quiz description"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Questions ({questions.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questionType">Question Type</Label>
                      <Select value={currentQuestion.type} onValueChange={handleQuestionTypeChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="questionPoints">Points</Label>
                      <Input
                        id="questionPoints"
                        type="number"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="questionText">Question</Label>
                    <Textarea
                      id="questionText"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      placeholder="Enter your question"
                      rows={2}
                    />
                  </div>

                  {currentQuestion.type === "multiple-choice" && (
                    <div>
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {currentQuestion.options?.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: option})}
                              className={currentQuestion.correctAnswer === option ? "bg-green-100" : ""}
                            >
                              Correct
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentQuestion.type === "true-false" && (
                    <div>
                      <Label>Correct Answer</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={currentQuestion.correctAnswer === "true" ? "default" : "outline"}
                          onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: "true"})}
                        >
                          True
                        </Button>
                        <Button
                          variant={currentQuestion.correctAnswer === "false" ? "default" : "outline"}
                          onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: "false"})}
                        >
                          False
                        </Button>
                      </div>
                    </div>
                  )}

                  {(currentQuestion.type === "open-ended" || currentQuestion.type === "true-false") && (
                    <div>
                      <Label htmlFor="correctAnswer">Correct Answer</Label>
                      <Input
                        id="correctAnswer"
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                        placeholder="Enter correct answer"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="explanation">Explanation (optional)</Label>
                    <Textarea
                      id="explanation"
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                      placeholder="Explain why this is the correct answer"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={addQuestion} className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                    <Button variant="outline" onClick={resetQuestionForm}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={saveQuiz} className="flex-1" disabled={questions.length === 0}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Quiz
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("play")}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="play" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="outline">{quiz.category}</Badge>
                      <Badge variant={quiz.difficulty === 'easy' ? 'default' : quiz.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                        {quiz.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>{quiz.questions.length} questions</p>
                    {quiz.timeLimit && <p>Time limit: {quiz.timeLimit} min</p>}
                    <p>Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Play
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareQuiz(quiz)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportQuiz(quiz)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {quizzes.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No quizzes created yet. Start by creating your first quiz!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TriviaQuizMaker;
