const { GLib } = imports.gi;
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
const { Box, Button, EventBox, Label, Overlay, Revealer, Scrollable } = Widget;
const { execAsync, exec } = Utils;
import { AnimatedCircProg } from "../../.commonwidgets/cairo_circularprogress.js";
import { MaterialIcon } from "../../.commonwidgets/materialicon.js";
import { showMusicControls } from "../../../variables.js";

const CUSTOM_MODULE_CONTENT_INTERVAL_FILE = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-interval.txt`;
const CUSTOM_MODULE_CONTENT_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-poll.sh`;
const CUSTOM_MODULE_LEFTCLICK_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-leftclick.sh`;
const CUSTOM_MODULE_RIGHTCLICK_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-rightclick.sh`;
const CUSTOM_MODULE_MIDDLECLICK_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-middleclick.sh`;
const CUSTOM_MODULE_SCROLLUP_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-scrollup.sh`;
const CUSTOM_MODULE_SCROLLDOWN_SCRIPT = `${GLib.get_user_cache_dir()}/ags/user/scripts/custom-module-scrolldown.sh`;


const colorGradients = {

  // Neon Cyberpunk Blue-Pink gradient
  neonCyberpunkColors:{
    startColor: { red: 0.0, green: 0.95, blue: 1.0, alpha: 1.0 },    // Bright cyan
    endColor: { red: 0.98, green: 0.2, blue: 0.99, alpha: 1.0 }      // Neon pink
  },

  // Neon Toxic Green-Yellow gradient
  neonToxicColors:{
    startColor: { red: 0.4, green: 1.0, blue: 0.0, alpha: 1.0 },     // Bright green
    endColor: { red: 0.98, green: 1.0, blue: 0.0, alpha: 1.0 }       // Neon yellow
  },
  // Success to warning
  WarningColors: {
    startColor: { red: 0.2, green: 0.8, blue: 0.2, alpha: 1.0 },
    endColor: { red: 0.9, green: 0.6, blue: 0.0, alpha: 1.0 }
  }, 


  // Futuristic / Tech
  neonSynthwave: {
      startColor: { red: 0.93, green: 0.0, blue: 0.83, alpha: 1.0 },  // Hot pink
      endColor: { red: 0.0, green: 0.84, blue: 1.0, alpha: 1.0 }      // Electric blue
  },
  
  matrixCode: {
      startColor: { red: 0.0, green: 0.8, blue: 0.3, alpha: 1.0 },    // Matrix green
      endColor: { red: 0.0, green: 1.0, blue: 0.5, alpha: 1.0 }       // Bright terminal green
  },

  // Premium / Luxury
  royalGold: {
      startColor: { red: 1.0, green: 0.84, blue: 0.0, alpha: 1.0 },   // Gold
      endColor: { red: 0.85, green: 0.65, blue: 0.13, alpha: 1.0 }    // Deep gold
  },

  ultravioletRoyal: {
      startColor: { red: 0.4, green: 0.0, blue: 0.8, alpha: 1.0 },    // Deep purple
      endColor: { red: 0.8, green: 0.3, blue: 1.0, alpha: 1.0 }       // Bright violet
  },

  // System Status
  criticalAlert: {
      startColor: { red: 1.0, green: 0.15, blue: 0.0, alpha: 1.0 },   // Bright red
      endColor: { red: 1.0, green: 0.5, blue: 0.0, alpha: 1.0 }       // Warning orange
  },

  healthyStatus: {
      startColor: { red: 0.0, green: 0.8, blue: 0.4, alpha: 1.0 },    // Healthy green
      endColor: { red: 0.4, green: 0.8, blue: 1.0, alpha: 1.0 }       // Calm blue
  },

  // Nature Inspired
  oceanBreeze: {
      startColor: { red: 0.0, green: 0.7, blue: 0.9, alpha: 1.0 },    // Ocean blue
      endColor: { red: 0.0, green: 0.9, blue: 0.7, alpha: 1.0 }       // Aqua
  },

  auroraGlow: {
      startColor: { red: 0.0, green: 0.8, blue: 0.6, alpha: 1.0 },    // Northern lights green
      endColor: { red: 0.4, green: 0.0, blue: 0.8, alpha: 1.0 }       // Aurora purple
  },

  // Minimal / Modern
  monochrome: {
      startColor: { red: 0.2, green: 0.2, blue: 0.2, alpha: 1.0 },    // Dark grey
      endColor: { red: 0.8, green: 0.8, blue: 0.8, alpha: 1.0 }       // Light grey
  },

  frostedGlass: {
      startColor: { red: 0.8, green: 0.9, blue: 1.0, alpha: 0.5 },    // Transparent white-blue
      endColor: { red: 0.9, green: 0.95, blue: 1.0, alpha: 0.8 }      // Frosted white
  }
};





function trimTrackTitle(title) {
  if (!title) return "";
  const cleanPatterns = [
    /【[^】]*】/, // Touhou n weeb stuff
    " [FREE DOWNLOAD]", // F-777
  ];
  cleanPatterns.forEach((expr) => (title = title.replace(expr, "")));
  return title;
}

const BarGroup = ({ child }) =>
  Box({
    className: "bar-group-margin bar-sides",
    children: [
      Box({
        className: "bar-group bar-group-standalone bar-group-pad-system",
        children: [child],
      }),
    ],
  });

const BarResource = (
  name,
  icon,
  command,
  circprogClassName = "bar-batt-circprog",
  textClassName = "txt-onSurfaceVariant",
  iconClassName = "bar-batt",
  colors = {
    startColor: { red: 0.2, green: 0.2, blue: 0.8, alpha: 1.0 },
    endColor: { red: 0.8, green: 0.2, blue: 0.2, alpha: 1.0 }
  }
) => {
  const resourceCircProg = AnimatedCircProg({
    className: `${circprogClassName}`,
    vpack: "center",
    hpack: "center",
    startColor: colors.startColor,
    endColor: colors.endColor
  });
  const resourceProgress = Box({
    homogeneous: true,
    children: [
      Overlay({
        child: Box({
          vpack: "center",
          className: `${iconClassName}`,
          homogeneous: true,
          children: [MaterialIcon(icon, "small")],
        }),
        overlays: [resourceCircProg],
      }),
    ],
  });
  const resourceLabel = Label({
    className: `txt-smallie ${textClassName}`,
  });
  const widget = Button({
    onClicked: () =>
      Utils.execAsync(["bash", "-c", `${userOptions.apps.taskManager}`]).catch(
        print
      ),
    child: Box({
      className: `spacing-h-4 ${textClassName}`,
      children: [resourceProgress, resourceLabel],
      setup: (self) =>
        self.poll(5000, () =>
          execAsync(["bash", "-c", command])
            .then((output) => {
              resourceCircProg.css = `font-size: ${Number(output)}px;`;
           //resourceLabel.label = `${Math.round(Number(output))}%`;
              widget.tooltipText = `${name}: ${Math.round(Number(output))}%`;
            })
            .catch(print)
        ),
    }),
  });
  return widget;
};

const TrackProgress = () => {
  const _updateProgress = (circprog) => {
    const mpris = Mpris.getPlayer("");
    if (!mpris) return;
    // Set circular progress value
    circprog.css = `font-size: ${Math.max(
      (mpris.position / mpris.length) * 100,
      0
    )}px;`;
  };
  return AnimatedCircProg({
    className: "bar-music-circprog",
    vpack: "center",
    hpack: "center",
    extraSetup: (self) =>
      self.hook(Mpris, _updateProgress).poll(3000, _updateProgress),
  });
};

const switchToRelativeWorkspace = async (self, num) => {
  try {
    const Hyprland = (
      await import("resource:///com/github/Aylur/ags/service/hyprland.js")
    ).default;
    Hyprland.messageAsync(
      `dispatch workspace ${num > 0 ? "+" : ""}${num}`
    ).catch(print);
  } catch {
    execAsync([
      `${App.configDir}/scripts/sway/swayToRelativeWs.sh`,
      `${num}`,
    ]).catch(print);
  }
};

export default () => {
  // TODO: use cairo to make button bounce smaller on click, if that's possible
  const playingState = Box({
    // Wrap a box cuz overlay can't have margins itself
    homogeneous: true,
    children: [
      Overlay({
        child: Box({
          vpack: "center",
          className: "bar-music-playstate",
          homogeneous: true,
          children: [
            Label({
              vpack: "center",
              className: "bar-music-playstate-txt",
              justification: "center",
              setup: (self) =>
                self.hook(Mpris, (label) => {
                  const mpris = Mpris.getPlayer("");
                  label.label = `${
                    mpris !== null && mpris.playBackStatus == "Playing"
                      ? "pause"
                      : "play_arrow"
                  }`;
                }),
            }),
          ],
          setup: (self) =>
            self.hook(Mpris, (label) => {
              const mpris = Mpris.getPlayer("");
              if (!mpris) return;
              label.toggleClassName(
                "bar-music-playstate-playing",
                mpris !== null && mpris.playBackStatus == "Playing"
              );
              label.toggleClassName(
                "bar-music-playstate",
                mpris !== null || mpris.playBackStatus == "Paused"
              );
            }),
        }),
        overlays: [TrackProgress()],
      }),
    ],
  });
  const trackTitle = Label({
    hexpand: true,
    className: "txt-smallie bar-music-txt",
    truncate: "end",
    maxWidthChars: 1, // Doesn't matter, just needs to be non negative
    setup: (self) =>
      self.hook(Mpris, (label) => {
        const mpris = Mpris.getPlayer("");
        if (mpris)
          label.label = `${trimTrackTitle(
            mpris.trackTitle
          )} • ${mpris.trackArtists.join(", ")}`;
        else label.label = getString("No media");
      }),
  });
  const musicStuff = Box({
    className: "spacing-h-10",
    hexpand: true,
    children: [playingState, trackTitle],
  });
  const SystemResourcesOrCustomModule = () => {
    // Check if $XDG_CACHE_HOME/ags/user/scripts/custom-module-poll.sh exists
    if (GLib.file_test(CUSTOM_MODULE_CONTENT_SCRIPT, GLib.FileTest.EXISTS)) {
      const interval =
        Number(Utils.readFile(CUSTOM_MODULE_CONTENT_INTERVAL_FILE)) || 5000;
      return BarGroup({
        child: Button({
          child: Label({
            className: "txt-smallie txt-onSurfaceVariant",
            useMarkup: true,
            setup: (self) =>
              Utils.timeout(1, () => {
                self.label = exec(CUSTOM_MODULE_CONTENT_SCRIPT);
                self.poll(interval, (self) => {
                  const content = exec(CUSTOM_MODULE_CONTENT_SCRIPT);
                  self.label = content;
                });
              }),
          }),
          onPrimaryClickRelease: () =>
            execAsync(CUSTOM_MODULE_LEFTCLICK_SCRIPT).catch(print),
          onSecondaryClickRelease: () =>
            execAsync(CUSTOM_MODULE_RIGHTCLICK_SCRIPT).catch(print),
          onMiddleClickRelease: () =>
            execAsync(CUSTOM_MODULE_MIDDLECLICK_SCRIPT).catch(print),
          onScrollUp: () =>
            execAsync(CUSTOM_MODULE_SCROLLUP_SCRIPT).catch(print),
          onScrollDown: () =>
            execAsync(CUSTOM_MODULE_SCROLLDOWN_SCRIPT).catch(print),
        }),
      });
    } else
      return BarGroup({
        child: Box({
          children: [
            BarResource(
              getString("Net Speed"),
              "wifi",
              `${GLib.get_home_dir()}/.config/ags/scripts/custom/custom-network-speed.sh`,
              "bar-ram-circprog"  ,"txt-onSurfaceVariant"  ,"bar-ram-icon", colorGradients.auroraGlow
            ),

            BarResource(
              getString("CPU Clock"),
              "settings_motion_mode",
              `${GLib.get_home_dir()}/.config/ags/scripts/custom/custom-module-cpu.sh`,
              "bar-cpu-circprog",
              "txt-onSurfaceVariant",
              colorGradients.criticalAlert
            ),
            BarResource(
              getString("RAM Used"),
              "memory",
              `${GLib.get_home_dir()}/.config/ags/scripts/custom/custom-module-ram.sh`,
              "bar-ram-circprog",
              "txt-onSurfaceVariant",
              "bar-ram-icon",
              colorGradients.neonToxicColors
            ),

            BarResource(
              getString("GPU clock"),
              "settings_motion_mode",
              `${GLib.get_home_dir()}/.config/ags/scripts/custom/custom-module-nvidia-clock.sh`,
              "bar-cpu-circprog",
              "txt-onSurfaceVariant",
              "bar-cpu-icon",
              colorGradients.matrixCode
            ),
            BarResource(
              getString("GPU MeM"),
              "memory",
              `${GLib.get_home_dir()}/.config/ags/scripts/custom/custom-module-nvidia-mem.sh`,
              "bar-ram-circprog",
              "txt-onSurfaceVariant",
              "bar-ram-icon",
              colorGradients.neonCyberpunkColors
            ),
            BarResource(
              getString("Minuto prova"),
              "memory",
              `date +%S | awk '{print $1 * 100 / 60}'`,
              "bar-ram-circprog",
              "txt-onSurfaceVariant",
              "bar-ram-icon",
              colorGradients.neonToxicColors
            ),
          ],
        }),
      });
  };
  return EventBox({
    onScrollUp: (self) => switchToRelativeWorkspace(self, -1),
    onScrollDown: (self) => switchToRelativeWorkspace(self, +1),
    child: Box({
      className: "spacing-h-4",
      children: [
        SystemResourcesOrCustomModule(),
        EventBox({
          child: BarGroup({ child: musicStuff }),
          onPrimaryClick: () =>
            showMusicControls.setValue(!showMusicControls.value),
          onSecondaryClick: () =>
            execAsync([
              "bash",
              "-c",
              'playerctl next || playerctl position `bc <<< "100 * $(playerctl metadata mpris:length) / 1000000 / 100"` &',
            ]).catch(print),
          onMiddleClick: () => execAsync("playerctl play-pause").catch(print),
          setup: (self) =>
            self.on("button-press-event", (self, event) => {
              if (event.get_button()[1] === 8)
                // Side button
                execAsync("playerctl previous").catch(print);
            }),
        }),
      ],
    }),
  });
};
