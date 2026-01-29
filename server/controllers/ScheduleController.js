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

 async bulkUpdate(req, res) {
  try {
    const { schedules } = req.body;

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ 
        error: "Envie um array de agendamentos" 
      });
    }

    if (schedules.length > 1000) {
      return res.status(400).json({ 
        error: "Limite de 1000 agendamentos por operação" 
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

    // Normalizar status
    const normalizeStatus = (status) => {
      if (!status) return null;
      const normalized = status.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      
      if (normalized.includes("conclu")) return "concluido";
      if (normalized.includes("agenda")) return "agendado";
      if (normalized.includes("cria")) return "criado";
      if (normalized.includes("atrasa")) return "atrasado";
      if (normalized.includes("cancel")) return "cancelado";
      return status;
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

    const errors = [];
    const updates = [];
    const notFound = [];

    // Processar cada agendamento
    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];

      // Validação: vin é obrigatório
      if (!schedule.vin) {
        errors.push(`Linha ${i + 1}: Chassi obrigatório`);
        continue;
      }

      const vin = schedule.vin;

      // Buscar agendamento pelo chassi
      const existingSchedule = await Schedule.findOne({ vin });

      if (!existingSchedule) {
        notFound.push(`Linha ${i + 1}: Agendamento com chassi ${vin} não encontrado`);
        continue;
      }

      // Montar objeto de atualização apenas com campos presentes
      const updateData = {};

      if (schedule.status) {
        updateData.status = normalizeStatus(schedule.status);
      }
      if (schedule.client) {
        updateData.client = schedule.client;
      }
      if (schedule.scheduledDate) {
        const date = parseDate(schedule.scheduledDate);
        if (date) updateData.scheduledDate = date;
      }
      if (schedule.model) {
        updateData.model = schedule.model;
      }
      if (schedule.plate) {
        updateData.plate = schedule.plate;
      }
      if (schedule.serviceType) {
        updateData.serviceType = normalizeServiceType(schedule.serviceType);
      }
      if (schedule.product) {
        updateData.product = schedule.product;
      }
      if (schedule.notes) {
        updateData.notes = schedule.notes;
      }

      updates.push({
        vin,
        updateData
      });
    }

    if (errors.length > 0 || notFound.length > 0) {
      return res.status(400).json({ 
        error: "Erros de validação", 
        details: [...errors, ...notFound].slice(0, 20)
      });
    }

    // Executar updates
    let successCount = 0;
    const updateErrors = [];

    for (const { vin, updateData } of updates) {
      try {
        await Schedule.findOneAndUpdate(
          { vin },
          updateData,
          { new: true }
        );
        successCount++;
      } catch (error) {
        updateErrors.push(`Chassi ${vin}: ${error.message}`);
      }
    }

    if (updateErrors.length > 0) {
      return res.status(207).json({
        success: true,
        count: successCount,
        message: `${successCount} agendamento(s) modificado(s), ${updateErrors.length} falharam`,
        errors: updateErrors.slice(0, 10)
      });
    }

    return res.status(200).json({
      success: true,
      count: successCount,
      message: `${successCount} agendamento(s) modificado(s) com sucesso`
    });

  } catch (error) {
    return res.status(500).json({ 
      error: error.message 
    });
  }
}

}

export default new ScheduleController();