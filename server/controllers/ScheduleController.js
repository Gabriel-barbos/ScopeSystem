import Schedule from "../models/Schedule.js";

class ScheduleController {
  async create(req, res) {
    try {
      const schedule = await Schedule.create(req.body);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async list(req, res) {
    try {
      const schedules = await Schedule.find()
        .populate("client", "name image")
        .populate("product", "name")
        .sort({ scheduledDate: 1 });
      return res.json(schedules);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const schedule = await Schedule.findById(req.params.id)
        .populate("client")
        .populate("product");

      if (!schedule) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      return res.json(schedule);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const schedule = await Schedule.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!schedule) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      return res.json(schedule);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const schedule = await Schedule.findByIdAndDelete(req.params.id);

      if (!schedule) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const { status } = req.body;

      const schedule = await Schedule.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!schedule) {
        return res.status(404).json({ error: "Agendamento não encontrado" });
      }

      return res.json(schedule);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  async bulkCreate(req, res) {
    try {
      const { schedules } = req.body;

      if (!Array.isArray(schedules) || schedules.length === 0) {
        return res.status(400).json({ 
          error: "Envie um array de agendamentos" 
        });
      }

      if (schedules.length > 1000) {
        return res.status(400).json({ 
          error: "Limite de 1000 agendamentos por importação" 
        });
      }

      // Normalizar serviceType
      const normalizeServiceType = (type) => {
        if (!type) return null;
        const normalized = type.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        
        if (normalized.includes("instal")) return "installation";
        if (normalized.includes("manut")) return "maintenance";
        if (normalized.includes("remo")) return "removal";
        return type;
      };

      // Converter data (aceita ISO, DD/MM/YYYY ou serial do Excel)
      const parseDate = (dateValue) => {
        if (!dateValue) return null;

        if (dateValue instanceof Date) {
          return dateValue;
        }

        if (typeof dateValue === 'number') {
          const utc_days = Math.floor(dateValue - 25569);
          const date = new Date(utc_days * 86400 * 1000);
          return date;
        }

        // Se for string
        if (typeof dateValue === 'string') {
          let date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return date;
          }

          const parts = dateValue.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts.map(p => parseInt(p));
            date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }

        return null;
      };

      // Processar e validar schedules
      const errors = [];
      const processedSchedules = schedules.map((schedule, idx) => {
        // Validações
        if (!schedule.vin) {
          errors.push(`Linha ${idx + 1}: Chassi obrigatório`);
        }
        if (!schedule.model) {
          errors.push(`Linha ${idx + 1}: Modelo obrigatório`);
        }
        if (!schedule.serviceType) {
          errors.push(`Linha ${idx + 1}: Tipo de serviço obrigatório`);
        }
        if (!schedule.client) {
          errors.push(`Linha ${idx + 1}: Cliente obrigatório`);
        }

        const normalizedType = normalizeServiceType(schedule.serviceType);
        
        if (normalizedType === "installation" && !schedule.product) {
          errors.push(`Linha ${idx + 1}: Produto obrigatório para instalação`);
        }

        // Converter scheduledDate
        const scheduledDate = parseDate(schedule.scheduledDate);

        return {
          ...schedule,
          serviceType: normalizedType,
          scheduledDate: scheduledDate
        };
      });

      if (errors.length > 0) {
        return res.status(400).json({ 
          error: "Erros de validação", 
          details: errors.slice(0, 10)
        });
      }

      // Bulk insert
      const created = await Schedule.insertMany(processedSchedules, {
        ordered: false
      });

      return res.status(201).json({
        success: true,
        count: created.length,
        message: `${created.length} agendamento(s) criado(s) com sucesso`
      });

    } catch (error) {
      if (error.name === 'MongoBulkWriteError') {
        return res.status(400).json({
          error: "Alguns registros falharam",
          details: error.writeErrors?.map(e => e.errmsg).slice(0, 10)
        });
      }

      return res.status(500).json({ 
        error: error.message 
      });
    }
  }
}

export default new ScheduleController();