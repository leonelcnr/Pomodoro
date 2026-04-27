import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, X, Play, Radio, CloudRain, Flame, Waves, CloudLightning, Users, Car, Train, Keyboard, Bird, Activity, Droplets } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import supabase from '@/config/supabase';

const AMBIENT_SOUNDS = [
    { id: "rain", name: "Lluvia", icon: CloudRain, file: "/sounds/rain.ogg" },
    { id: "fire", name: "Fogata", icon: Flame, file: "/sounds/fire.ogg" },
    { id: "ocean", name: "Océano", icon: Waves, file: "/sounds/ocean.ogg" },
    { id: "thunder", name: "Truenos", icon: CloudLightning, file: "/sounds/thunder.ogg" },
    { id: "people", name: "Personas", icon: Users, file: "/sounds/people.ogg" },
    { id: "traffic", name: "Tráfico", icon: Car, file: "/sounds/traffic.ogg" },
    { id: "train", name: "Tren", icon: Train, file: "/sounds/train.ogg" },
    { id: "keyboard", name: "Teclado", icon: Keyboard, file: "/sounds/keyboard.ogg" },
    { id: "birds", name: "Pájaros", icon: Bird, file: "/sounds/birds.ogg" },
    { id: "brown_noise", name: "Ruido Marrón", icon: Activity, file: "/sounds/brown_noise.ogg" },
    { id: "jazz", name: "Jazz", icon: Music, file: "/sounds/jazz.ogg" },
    { id: "underwater", name: "Subacuático", icon: Droplets, file: "/sounds/white-noise-underwater.ogg" },
];

export const MusicPlayer = React.memo(function MusicPlayer({ roomId }: { roomId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Ambient State
    const [ambientVolumes, setAmbientVolumes] = useState<Record<string, number>>({});
    const [isAmbientOn, setIsAmbientOn] = useState(true);
    const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

    // Local State
    const [localUrlInput, setLocalUrlInput] = useState("");
    const [localEmbedUrl, setLocalEmbedUrl] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);

    // Room State
    const [roomUrlInput, setRoomUrlInput] = useState("");
    const [roomState, setRoomState] = useState({ url: "", isPlaying: false });
    const [roomError, setRoomError] = useState<string | null>(null);

    // YouTube / Spotify regex
    const ytRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    const spRegex = /^(?:https?:\/\/)?(?:open\.)?spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)(?:\?.*)?$/;

    // Detect click outside to close floating panel
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Handle Ambient Sounds Playback
    useEffect(() => {
        Object.keys(audioRefs.current).forEach(id => {
            const audio = audioRefs.current[id];
            if (audio) {
                const vol = ambientVolumes[id] || 0;
                audio.volume = vol / 100;

                if (isAmbientOn && vol > 0) {
                    audio.play().catch(e => console.warn(`Audio ${id} no pudo reproducirse (requiere interacción del usuario o archivo faltante):`, e));
                } else {
                    audio.pause();
                }
            }
        });
    }, [ambientVolumes, isAmbientOn]);

    // Subscribing to Supabase for Room Music
    useEffect(() => {
        if (!roomId) return;

        const fetchState = async () => {
            const { data } = await supabase.from("rooms").select("music_state").eq("id", roomId).single();
            if (data?.music_state) {
                setRoomState(data.music_state);
            }
        };
        fetchState();

        const channel = supabase.channel(`room-music-${roomId}`)
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => {
                if (payload.new && payload.new.music_state) {
                    setRoomState(payload.new.music_state);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    const updateRoomState = async (newState: Partial<typeof roomState>) => {
        if (!roomId) return;
        const finalState = { ...roomState, ...newState, updatedAt: new Date().toISOString() };
        setRoomState(finalState);

        const { error } = await supabase.from("rooms").update({ music_state: finalState }).eq("id", roomId);
        if (error) {
            console.error("Error Supabase sincronizando música:", error);
            alert("⚠️ Error: No se pudo sincronizar la música con la sala.\n\nPor favor, asegúrate de haber creado la columna 'music_state' (tipo JSONB) en la tabla 'rooms' de tu Supabase.");
        }
    };

    const handleLoadLocal = (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (!localUrlInput.trim()) { setLocalEmbedUrl(null); return; }

        const ytMatch = localUrlInput.match(ytRegex);
        if (ytMatch && ytMatch[1]) {
            setLocalEmbedUrl(`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`);
            return;
        }

        const spMatch = localUrlInput.match(spRegex);
        if (spMatch && spMatch[1] && spMatch[2]) {
            setLocalEmbedUrl(`https://open.spotify.com/embed/${spMatch[1]}/${spMatch[2]}?utm_source=generator&theme=0`);
            return;
        }

        setLocalError("URL inválida. Usa YouTube o Spotify.");
    };

    const handleLoadRoom = (e: React.FormEvent) => {
        e.preventDefault();
        setRoomError(null);
        if (!roomUrlInput.trim()) return;

        const ytMatch = roomUrlInput.match(ytRegex);
        if (ytMatch && ytMatch[1]) {
            // Using iframe embed URL to guarantee playback
            updateRoomState({ url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`, isPlaying: true });
            setRoomUrlInput("");
        } else {
            setRoomError("Para la sala sincronizada, usa solo enlaces de YouTube.");
        }
    };

    const activeMusic = localEmbedUrl || roomState.url || (isAmbientOn && Object.values(ambientVolumes).some(v => v > 0));

    return (
        <div className="relative flex items-center" ref={dropdownRef}>
            {/* Hidden Audio Elements for Ambient Sounds */}
            {AMBIENT_SOUNDS.map(sound => (
                <audio
                    key={sound.id}
                    ref={el => { audioRefs.current[sound.id] = el; }}
                    src={sound.file}
                    loop
                />
            ))}

            <Button
                variant={isOpen || activeMusic ? "default" : "outline"}
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={`h-10 w-10 transition-all ${activeMusic && !isOpen ? 'bg-primary text-primary-foreground shadow-sm animate-pulse' : 'text-muted-foreground hover:text-foreground shadow-sm bg-background border-border/50'}`}
                title="Música de Fondo"
            >
                <Music className="w-5 h-5" />
            </Button>

            {/* Modal flotante */}
            <div
                className={`fixed z-50 bottom-24 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 w-[340px] sm:w-[400px] bg-popover text-popover-foreground border shadow-2xl rounded-xl p-5 transition-all duration-300 flex flex-col gap-4 ${isOpen ? 'opacity-100 pointer-events-auto translate-y-0 scale-100 visible' : 'opacity-0 pointer-events-none translate-y-4 scale-95 invisible'}`}
            >
                <div className="flex flex-col gap-1">
                    <h4 className="font-semibold leading-none tracking-tight">Reproductor</h4>
                    <p className="text-sm text-muted-foreground leading-tight">Configura tu ambiente ideal de concentración.</p>
                </div>

                <Tabs defaultValue="ambient" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="ambient">Ambiental</TabsTrigger>
                        <TabsTrigger value="local">Local</TabsTrigger>
                        <TabsTrigger value="room" disabled={!roomId}>Sala</TabsTrigger>
                    </TabsList>

                    {/* TABS AMBIENTAL */}
                    <TabsContent value="ambient" className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-border/50">
                            <span className="text-sm font-medium text-foreground">Sonidos Activos</span>
                            <Switch checked={isAmbientOn} onCheckedChange={setIsAmbientOn} />
                        </div>

                        <div className="grid gap-5 max-h-[260px] overflow-y-auto pr-3 custom-scrollbar">
                            {AMBIENT_SOUNDS.map((sound) => {
                                const Icon = sound.icon;
                                const volume = ambientVolumes[sound.id] || 0;
                                const isActive = volume > 0 && isAmbientOn;

                                return (
                                    <div key={sound.id} className="flex items-center gap-4 group">
                                        <div className={`p-2 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {sound.name}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">
                                                    {volume}%
                                                </span>
                                            </div>
                                            <Slider
                                                value={[volume]}
                                                max={100}
                                                step={1}
                                                onValueChange={(vals) => setAmbientVolumes(prev => ({ ...prev, [sound.id]: vals[0] }))}
                                                disabled={!isAmbientOn}
                                                className={`transition-opacity ${!isAmbientOn ? "opacity-40" : ""}`}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </TabsContent>

                    {/* TABS INDIVIDUAL */}
                    <TabsContent value="local" className="space-y-4">
                        <form onSubmit={handleLoadLocal} className="flex gap-2">
                            <Input
                                value={localUrlInput}
                                onChange={(e) => setLocalUrlInput(e.target.value)}
                                placeholder="YouTube o Spotify..."
                                className="flex-1 text-sm"
                            />
                            <Button type="submit" size="icon"><Play className="w-4 h-4" /></Button>
                        </form>
                        {localError && <p className="text-xs text-destructive">{localError}</p>}

                        <div className={`${localEmbedUrl ? 'block' : 'hidden'} relative w-full rounded-md overflow-hidden bg-muted border flex flex-col items-center justify-center`}>
                            <div className={`w-full ${localEmbedUrl && localEmbedUrl.includes("youtube") ? "aspect-video" : "h-[152px]"}`}>
                                {localEmbedUrl && (
                                    <iframe
                                        src={localEmbedUrl}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                        className="block relative z-10"
                                    ></iframe>
                                )}
                            </div>
                            <Button
                                variant="default"
                                size="icon"
                                className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm z-50"
                                onClick={() => setLocalEmbedUrl(null)}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                    </TabsContent>

                    {/* TABS SALA */}
                    <TabsContent value="room" className="space-y-4">
                        <form onSubmit={handleLoadRoom} className="flex gap-2">
                            <Input
                                value={roomUrlInput}
                                onChange={(e) => setRoomUrlInput(e.target.value)}
                                placeholder="Enlace de YouTube..."
                                className="flex-1 text-sm"
                            />
                            <Button type="submit" size="icon"><Radio className="w-4 h-4" /></Button>
                        </form>
                        {roomError && <p className="text-xs text-destructive">{roomError}</p>}

                        <div className={`${roomState.url ? 'block' : 'hidden'} relative w-full rounded-md overflow-hidden bg-muted border flex flex-col items-center justify-center`}>
                            <div className="w-full aspect-video relative">
                                {roomState.url && (
                                    <iframe
                                        src={roomState.url}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                        className="block relative z-10"
                                    ></iframe>
                                )}
                            </div>

                            <Button
                                variant="default"
                                size="icon"
                                className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm z-50 pointer-events-auto"
                                onClick={() => updateRoomState({ url: "", isPlaying: false })}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        </div>
                        {roomState.url && (
                            <p className="text-xs text-muted-foreground text-center">La música de la sala está sincronizada con todos los usuarios.</p>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
});

