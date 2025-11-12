import Bloodborne from "./bloodborne.jpg";
import MonsterHunterWorld from "./monster_hunter_world.jpg";
import Persona5Royal from "./persona_5_royal.jpg";
import Minecraft from "./minecraft.jpg";
import TheLegendOfZeldaBreathOfTheWild from "./the_legend_of_zelda_breath_of_the_wild.jpg";
import RedDeadRedemption2 from "./red_dead_redemption_2.jpg";
import GrandTheftAutoV from "./grand_theft_auto_v.jpg";
import HalfLifeAlyx from "./half_life_alyx.jpg";
import Cyberpunk2077 from "./cyberpunk_2077.jpg";
import Portal2 from "./portal_2.jpg";
import EnigmaDoMedo from "./enigma_do_medo.jpg";
import HorizonZeroDawn from "./horizon_zero_dawn.jpg";
import AmongUs from "./among_us.jpg";
import SekiroShadowsDieTwice from "./sekiro_shadows_die_twice.jpg";
import Fallout4 from "./fallout_4.jpg";
import TheElderScrollsVSkyrim from "./the_elder_scrolls_v_skyrim.jpg";
import YakuzaLikeADragon from "./yakuza_like_a_dragon.jpg";
import ResidentEvil7Biohazard from "./resident_evil_7_biohazard.jpg";
import StardewValley from "./stardew_valley.jpg";
import ALendaDoHeroi from "./a_lenda_do_herói.jpg";
import CallOfDutyModernWarfare from "./call_of_duty_modern_warfare.jpg";


// --- Objeto de Mapeamento ---
export const GAME_ASSETS = {
    bloodborne: Bloodborne,
    monster_hunter_world: MonsterHunterWorld,
    persona_5_royal: Persona5Royal,
    minecraft: Minecraft,
    the_legend_of_zelda_breath_of_the_wild: TheLegendOfZeldaBreathOfTheWild,
    red_dead_redemption_2: RedDeadRedemption2,
    grand_theft_auto_v: GrandTheftAutoV,
    "half-life_alyx": HalfLifeAlyx, // <-- Se o seu normalizador não removeu o hífen
    half_life_alyx: HalfLifeAlyx, // <-- Se o seu normalizador removeu o hífen // Note: Seu normalizador remove ':' e capitalização, mas se ele NÃO remover o hífen, use a chave correta.
    cyberpunk_2077: Cyberpunk2077,
    portal_2: Portal2,
    enigma_do_medo: EnigmaDoMedo, // O seu normalizador remove acentos, então 'o_medo' ou 'do_medo'
    horizon_zero_dawn: HorizonZeroDawn,
    among_us: AmongUs,
    sekiro_shadows_die_twice: SekiroShadowsDieTwice,
    fallout_4: Fallout4,
    the_elder_scrolls_v_skyrim: TheElderScrollsVSkyrim,
    yakuza_like_a_dragon: YakuzaLikeADragon,
    resident_evil_7_biohazard: ResidentEvil7Biohazard,
    stardew_valley: StardewValley,
    a_lenda_do_heroi: ALendaDoHeroi,
    call_of_duty_modern_warfare: CallOfDutyModernWarfare,
};