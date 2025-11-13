import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { calculatePrice } from "@/lib/pricing";

const bookingFormSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  email: z.string().email("L'adresse courriel est invalide"),
  gradeLevel: z.string().min(1, "Le niveau scolaire est requis"),
  subject: z.enum(["math", "science"], { required_error: "La matière est requise" }),
  duration: z.enum(["1h", "1h30", "2h"], { required_error: "La durée est requise" }),
  location: z.enum(["teacher", "home", "online"], { required_error: "Le lieu est requis" }),
  address: z.string().optional(),
  requestedStartTime: z.date({ required_error: "La date et l'heure sont requises" }),
}).refine((data) => {
  if (data.location === "home" && !data.address) {
    return false;
  }
  return true;
}, {
  message: "L'adresse est requise pour un cours à domicile",
  path: ["address"],
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function Booking() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<Array<{ start: string; end: string; startDateTime: Date; duration: string; durationMinutes: number }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      gradeLevel: "",
      subject: undefined,
      duration: undefined,
      location: undefined,
      address: "",
    },
  });

  const watchGradeLevel = form.watch("gradeLevel");
  const watchDuration = form.watch("duration");
  const watchLocation = form.watch("location");

  const calculateCurrentPrice = () => {
    if (!watchGradeLevel || !watchDuration || !watchLocation) return null;

    const gradeType = watchGradeLevel.startsWith("primaire") ? "primaire" : "secondaire";
    return calculatePrice({
      grade: gradeType,
      duration: watchDuration,
      location: watchLocation,
    });
  };

  const currentPrice = calculateCurrentPrice();

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    } else {
      setAvailableSlots([]);
      setSelectedTimeSlot("");
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async (date: Date) => {
    setLoadingSlots(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(`/api/time-slots?date=${dateStr}`);
      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créneaux disponibles.",
        variant: "destructive",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const gradeType = data.gradeLevel.startsWith("primaire") ? "primaire" : "secondaire";
      const price = calculatePrice({
        grade: gradeType,
        duration: data.duration,
        location: data.location,
      });

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          price,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la réservation");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Réservation confirmée !",
        description: data.message,
      });
      form.reset();
      setSelectedDate(undefined);
      setSelectedTimeSlot("");
      setAvailableSlots([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    bookingMutation.mutate(data);
  };

  const getAvailableTimesForDate = () => {
    if (!selectedDate || !availableSlots.length) return [];
    
    const normalizedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    return availableSlots
      .filter((slot) => {
        const slotDate = new Date(slot.startDateTime);
        const normalizedSlot = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
        return normalizedSlot.getTime() === normalizedDate.getTime();
      })
      .map((slot) => {
        const slotDate = new Date(slot.startDateTime);
        return {
          time: format(slotDate, "HH:mm", { locale: fr }),
          datetime: slotDate,
        };
      })
      .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
  };

  const availableTimes = getAvailableTimesForDate();

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot("");
    form.setValue("requestedStartTime", undefined as any);
  };

  const handleTimeSlotSelect = (slot: { start: string; end: string; startDateTime: Date; duration: string }) => {
    const slotKey = `${slot.start}-${slot.end}-${slot.duration}`;
    setSelectedTimeSlot(slotKey);
    form.setValue("requestedStartTime", new Date(slot.startDateTime));
    form.setValue("duration", slot.duration as "1h" | "1h30" | "2h");
  };

  return (
    <div className="min-h-screen bg-accent/30 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Réserver un cours</h1>
          <p className="text-lg text-muted-foreground">
            Remplissez le formulaire ci-dessous pour réserver votre cours particulier
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations de réservation</CardTitle>
            <CardDescription>
              Sélectionnez d'abord la matière pour voir les créneaux disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informations personnelles</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Jean" {...field} data-testid="input-firstname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Tremblay" {...field} data-testid="input-lastname" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="514-123-4567" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Courriel</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jean@exemple.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Détails du cours</h3>
                  
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Niveau scolaire</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gradelevel">
                              <SelectValue placeholder="Sélectionnez le niveau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primaire-1">Primaire 1</SelectItem>
                            <SelectItem value="primaire-2">Primaire 2</SelectItem>
                            <SelectItem value="primaire-3">Primaire 3</SelectItem>
                            <SelectItem value="primaire-4">Primaire 4</SelectItem>
                            <SelectItem value="primaire-5">Primaire 5</SelectItem>
                            <SelectItem value="primaire-6">Primaire 6</SelectItem>
                            <SelectItem value="secondaire-1">Secondaire 1</SelectItem>
                            <SelectItem value="secondaire-2">Secondaire 2</SelectItem>
                            <SelectItem value="secondaire-3">Secondaire 3</SelectItem>
                            <SelectItem value="secondaire-4">Secondaire 4</SelectItem>
                            <SelectItem value="secondaire-5">Secondaire 5</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matière</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-subject">
                              <SelectValue placeholder="Sélectionnez la matière" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="math">
                              <div className="flex items-center gap-2">
                                <span>🔢</span>
                                <span>Mathématiques</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="science">
                              <div className="flex items-center gap-2">
                                <span>🔬</span>
                                <span>Sciences</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Lieu du cours</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="teacher" data-testid="radio-teacher" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                Chez le professeur
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="home" data-testid="radio-home" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                À domicile
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="online" data-testid="radio-online" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                En ligne 
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchLocation === "home" && (
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse complète</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="123 rue Principale, Montréal, QC H1A 1A1"
                              {...field}
                              data-testid="input-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="requestedStartTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date du cours</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="pl-3 text-left font-normal"
                                data-testid="button-calendar"
                              >
                                {selectedDate ? (
                                  format(selectedDate, "PPP", { locale: fr })
                                ) : (
                                  <span>Sélectionnez une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={handleDateSelect}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedDate && (
                    <div className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Créneaux horaires disponibles (toutes durées)
                      </FormLabel>
                      
                      {loadingSlots ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">Chargement des créneaux...</p>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableSlots.map((slot) => {
                              const slotKey = `${slot.start}-${slot.end}-${slot.duration}`;
                              return (
                                <Button
                                  key={slotKey}
                                  type="button"
                                  variant={selectedTimeSlot === slotKey ? "default" : "outline"}
                                  className="w-full h-auto py-4 flex flex-col items-center justify-center"
                                  onClick={() => handleTimeSlotSelect(slot)}
                                >
                                  <div className="text-lg font-semibold">
                                    {slot.start} - {slot.end}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Durée: {slot.duration}
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 Les plages incluent automatiquement 30 min avant et après pour le déplacement
                          </p>
                        </>
                      ) : (
                        <Alert>
                          <AlertDescription>
                            Aucun créneau disponible pour cette date. 
                            Veuillez choisir une autre date.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>

                {currentPrice && (
                  <Card className="bg-success/10 border-success/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-success" />
                          <span className="font-semibold text-lg">Prix total</span>
                        </div>
                        <div className="text-3xl font-bold text-success" data-testid="text-price">
                          {currentPrice} $
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  disabled={bookingMutation.isPending || !selectedTimeSlot}
                  data-testid="button-submit-booking"
                >
                  {bookingMutation.isPending ? "Réservation en cours..." : "Confirmer la réservation"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
