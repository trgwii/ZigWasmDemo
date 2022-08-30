const std = @import("std");

extern fn print([*:0]const u8) void;
extern fn alloc(bytes: u32) [*]u8;

const allocator = std.heap.page_allocator;

export fn resizeScreen(width: u32, height: u32, screen: ?[*]u32) ?[*]u32 {
    if (screen) |s| allocator.free(@ptrCast(*[1]u32, s));
    const result = allocator.alloc(u32, width * height) catch {
        print("resizeScreen failed!");
        return null;
    };
    return result.ptr;
}

const Keys = struct {
    Up: bool,
    Left: bool,
    Down: bool,
    Right: bool,
};

export fn setKeys(key: u32, down: u32, handle: ?*Keys) ?*Keys {
    if (handle) |keys| {
        // var buf: [1024:0]u8 = undefined;
        // _ = std.fmt.bufPrint(&buf, "{any}\x00", .{keys}) catch unreachable;
        // print(&buf);
        if (key == 0) keys.Up = down == 1;
        if (key == 1) keys.Left = down == 1;
        if (key == 2) keys.Down = down == 1;
        if (key == 3) keys.Right = down == 1;
        return keys;
    } else {
        const keys = allocator.create(Keys) catch {
            print("setKeys failed!");
            return null;
        };
        if (key == 0) keys.Up = down == 1;
        if (key == 1) keys.Left = down == 1;
        if (key == 2) keys.Down = down == 1;
        if (key == 3) keys.Right = down == 1;
        return keys;
    }
}

const Game = struct {
    player: struct {
        x: i32,
        y: i32,
    },
};

export fn update(game: ?*Game, keys: *Keys, width: u32, height: u32) ?*Game {
    if (game) |g| {
        g.player.y += (@as(i32, @boolToInt(keys.Down)) - @as(i32, @boolToInt(keys.Up))) * 5;
        g.player.x += (@as(i32, @boolToInt(keys.Right)) - @as(i32, @boolToInt(keys.Left))) * 5;
        if (g.player.x < 0) g.player.x = 0;
        if (g.player.y < 0) g.player.y = 0;
        if (g.player.x > width - 10) g.player.x = @intCast(i32, width) - 10;
        if (g.player.y > height - 10) g.player.y = @intCast(i32, height) - 10;
        return g;
    } else {
        const result = allocator.create(Game) catch {
            print("update failed!");
            return null;
        };
        result.player.x = 0;
        result.player.y = 0;
        return result;
    }
}

var prng = std.rand.DefaultPrng.init(1337);
var random = prng.random();

const masks = [13]u32{
    0xFFFFFFCC,
    0xFFFFFFBB,
    0xFFFFFF88,
    0xFFFFFFEE,
    0xFFFFFF99,
    0xFFFFFF66,
    0xFFFFFF77,
    0xFFFFFF55,
    0xFFFFFFDD,
    0xFFFFFF44,
    0xFFFFFFAA,
    0xFFFFFF22,
    0xFFFFFF00,
};

export fn render(game: *Game, mem: [*]u32, width: u32, height: u32) void {
    var y: u32 = 0;
    while (y < height) : (y += 1) {
        var x: u32 = 0;
        while (x < width) : (x += 1) {
            mem[y * width + x] = 0xFF0000FF & masks[(y * 3 + x) % masks.len];
        }
    }
    var pY: u32 = 0;
    while (pY < 10) : (pY += 1) {
        var pX: u32 = 0;
        while (pX < 10) : (pX += 1) {
            mem[
                (@intCast(u32, game.player.y) + pY) * width +
                    (@intCast(u32, game.player.x) + pX)
            ] = 0x0000FFFF;
        }
    }
}
