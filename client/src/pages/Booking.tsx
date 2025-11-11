import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { calculatePrice } from "@/lib/pricing";
import { apiRequest, queryClient } from "@/lib/queryClient";

const bookingFormSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  email: z.string().email("L'adresse courriel est invalide"),
  gradeLevel: z.string().min(1, "Le niveau scolaire est requis"),
  duration: z.enum(["1h", "1h30", "2h"], { required_error: "La durée est requise" }),
  location: z.enum(["teacher", "home"], { required_error: "Le lieu est requis" }),
  address: z.string().optional(),
  dateTime: z.date({ required_error: "La date et l'heure sont requises" }),
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

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      gradeLevel: "",
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

  const { data: availableSlots, isLoading: loadingSlots } = useQuery<Date[]>({
    queryKey: ["/api/time-slots"],
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const gradeType = data.gradeLevel.startsWith("primaire") ? "primaire" : "secondaire";
      const price = calculatePrice({
        grade: gradeType,
        duration: data.duration,
        location: data.location,
      });

      return apiRequest("POST", "/api/bookings", {
        ...data,
        price,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-slots"] });
      toast({
        title: "Réservation confirmée !",
        description: "Un courriel de confirmation vous a été envoyé.",
      });
      form.reset();
      setSelectedDate(undefined);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    bookingMutation.mutate(data);
  };

  const isSlotAvailable = (date: Date) => {
    if (!availableSlots) return false;
    return availableSlots.some(
      (slot) => new Date(slot).toISOString() === date.toISOString()
    );
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
              Tous les champs sont obligatoires sauf indication contraire
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
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée du cours</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-duration">
                              <SelectValue placeholder="Sélectionnez la durée" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1h">1 heure</SelectItem>
                            <SelectItem value="1h30">1 heure 30</SelectItem>
                            <SelectItem value="2h">2 heures</SelectItem>
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
                    name="dateTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date et heure du cours</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="pl-3 text-left font-normal"
                                data-testid="button-calendar"
                              >
                                {field.value ? (
                                  format(field.value, "PPP 'à' p", { locale: fr })
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
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => !isSlotAvailable(date)}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  disabled={bookingMutation.isPending}
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
